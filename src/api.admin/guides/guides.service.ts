import { Injectable } from "@nestjs/common";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";
import { CImagableService } from "src/common/services/imagable.service";
import { CUploadsService } from "src/common/services/uploads.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IJsonFormData } from "src/model/dto/json.formdata,interface";
import { IResponse } from "src/model/dto/response.interface";
import { CGuide } from "src/model/entities/guide";
import { IKeyValue } from "src/model/keyvalue.interface";
import { DataSource, DeleteResult, In, IsNull, Not } from "typeorm";
import { IGuideCreate } from "./dto/guide.create.interface";
import { IGuideUpdate } from "./dto/guide.update.interface";
import { CGuideLink } from "src/model/entities/guide.link";
import { CTask } from "src/model/entities/task";
import { CCat } from "src/model/entities/cat";
import { CSocketGateway } from "src/socket/socket.gateway";
import { CUser } from "src/model/entities/user";
import { CTgBotService } from "src/common/services/mailable/tg.bot.service";

@Injectable()
export class CGuidesService extends CImagableService {
    protected entity: string = "CGuide";
    protected folder: string = "guides";
    protected resizeMap: IKeyValue<number> = {img: 300};

    constructor(
        protected dataSource: DataSource,
        protected uploadsService: CUploadsService,
        protected appService: CAppService,
        protected errorsService: CErrorsService,
        protected tgBotService: CTgBotService,
        protected socketGateway: CSocketGateway,
    )
    {
        super(uploadsService, dataSource);
    }

    public async chunk(dto: IGetList): Promise<IResponse<CGuide[]>> {
        try {
            const filter = this.buildFilter(dto.filter);
            const sortBy = `guides.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const predata = await this.dataSource
                .getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoin("guides.translations", "translations")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = predata.map(x => x.id);
            const data = await this.dataSource
                .getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoinAndSelect("guides.translations", "translations")
                .leftJoinAndSelect("guides.cat", "cat")
                .leftJoinAndSelect("cat.translations", "cat_translations")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoin("guides.translations", "translations") // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number): Promise<IResponse<CGuide>> {
        try {
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            const data = await this.dataSource
                .getRepository(CGuide)
                .createQueryBuilder("guides")
                .where(`guides.id='${id}'`)
                .leftJoinAndSelect("guides.translations", "translations")
                .addSelect("translations.content")
                .addSelect("translations.contentshort")
                .leftJoinAndSelect("guides.links", "links")
                .leftJoinAndSelect("guides.tasks", "tasks")
                .leftJoinAndSelect("tasks.translations", "task_translations")
                .addSelect("task_translations.content")
                .addSelect("tasks.yt_content")
                .orderBy({
                    "links.pos": "ASC",
                    "tasks.pos": "ASC",
                })
                .getOne();
            return data ? {statusCode: 200, data} : {statusCode: 404, error: "guide not found"};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number): Promise<IResponse<void>> {
        try {
            const x = await this.dataSource.getRepository(CGuide).findOneBy({id});
            await this.deleteUnbindedImgOnDelete([x], false);
            await this.dataSource.getRepository(CGuide).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async deleteBulk(ids: number[]): Promise<IResponse<void>> {
        try {
            const xl = await this.dataSource.getRepository(CGuide).findBy({id: In(ids)});
            await this.deleteUnbindedImgOnDelete(xl, false);
            await this.dataSource.getRepository(CGuide).delete(ids);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.deleteBulk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CGuide>> {
        try {
            const dto = JSON.parse(fd.data) as IGuideCreate;
            const x = this.dataSource.getRepository(CGuide).create(dto);
            await this.buildImg(x, uploads);
            x.price = x.tasks.filter(t => t.type === "main").reduce((acc, t) => acc + t.price, 0);
            x.time = x.tasks.filter(t => t.type === "main").reduce((acc, t) => acc + t.time, 0);
            x.tasks.filter(t => t.contenttype === "yt").forEach(t => t.yt_content = this.appService.adjustYtContent(t.yt_content));
            await this.dataSource.getRepository(CGuide).save(x);
            this.tgNotifyNewguide(x);
            return {statusCode: 201, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(fd: IJsonFormData, uploads: Express.Multer.File[]): Promise<IResponse<CGuide>> {
        try {
            const dto = JSON.parse(fd.data) as IGuideUpdate;
            const x = this.dataSource.getRepository(CGuide).create(dto);
            const old = await this.dataSource.getRepository(CGuide).findOne({where: {id: x.id}, relations: ["translations", "tasks"]});
            await this.buildImg(x, uploads);
            await this.deleteUnbindedImgOnUpdate(x, old); // if img changed then delete old file
            x.price = x.tasks.filter(t => t.type === "main").reduce((acc, t) => acc + t.price, 0);
            x.time = x.tasks.filter(t => t.type === "main").reduce((acc, t) => acc + t.time, 0);
            x.tasks.filter(t => t.contenttype === "yt").forEach(t => t.yt_content = this.appService.adjustYtContent(t.yt_content));
            await this.dataSource.getRepository(CGuide).save(x);
            await this.deleteUnbindedLinks();
            await this.deleteUnbindedTasks();
            const newTasks = this.getNewTasks(x, old);

            if (newTasks.length) {
                this.tgNotifyNewtask(x, newTasks);
            }

            return {statusCode: 200, data: x};
        } catch (err) {
            const error = await this.errorsService.log("api.admin/CGuidesService.update", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////////
    // utils
    //////////////////////

    private deleteUnbindedLinks(): Promise<DeleteResult> {
        return this.dataSource.getRepository(CGuideLink).delete({guide_id: IsNull()});
    }

    private deleteUnbindedTasks(): Promise<DeleteResult> {
        return this.dataSource.getRepository(CTask).delete({guide_id: IsNull()});
    }

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.from !== undefined) {
            filter += ` AND guides.created_at >= '${dtoFilter.from}'`;
        }

        if (dtoFilter.to !== undefined) {
            filter += ` AND guides.created_at <= '${dtoFilter.to}'`;
        }

        if (dtoFilter.name) {
            filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.name}%')`;
        }

        if (dtoFilter.cat_id !== undefined) {
            if (dtoFilter.cat_id === null) {
                filter += ` AND guides.cat_id IS NULL`;
            } else {
                filter += ` AND guides.cat_id = '${dtoFilter.cat_id}'`;
            }
        }

        if (dtoFilter.search) {
            filter += ` AND (LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%') OR guides.id='${dtoFilter.search}')`;
        }

        return filter;
    }

    private async fakeInit(): Promise<void> {
        const cats = await this.dataSource.getRepository(CCat).find();
        let j = 0;

        for (let cat of cats) {
            for (let i = 0; i < 100; i++) {
                const guide = new CGuide().fakeInit(cat.id, j++);
                await this.dataSource.getRepository(CGuide).save(guide);
            }
        }
    }

    private getNewTasks(x: CGuide, old: CGuide): CTask[] {
        return x.tasks.filter(t => !old.tasks.map(ot => ot.id).includes(t.id));
    }

    private async tgNotifyNewtask(guide: CGuide, newTasks: CTask[]): Promise<void> {
        try {
            const now  = new Date();
            // отправляем тем, у кого включен параметр tg_tasks, оплачен тариф и у кого этот гайд в избранном
            const users = await this.dataSource
                .getRepository(CUser)
                .createQueryBuilder("users")
                .leftJoinAndSelect("users.lang", "lang")
                .leftJoinAndSelect("users.favoritions", "favoritions")
                .where(`users.active='1' AND users.tg_id IS NOT NULL AND users.tg_active='1' AND users.tg_tasks='1' AND users.paid_until IS NOT NULL AND users.paid_until > '${this.appService.mysqlDate(now, "datetime")}' AND favoritions.guide_id=${guide.id}`)
                .getMany();

            for (let user of users) {
                for (let task of newTasks) {
                    await this.appService.pause(1000); // не больше 30 сообщений в секунду, возьмем с запасом - 1 в секунду
                    await this.tgBotService.userNewtask(user, guide, task); // здесь можно проверить statusCode и что-то предпринять, если сообщение не уходит
                }
            }
        } catch (err) {
            await this.errorsService.log("api.admin/CGuidesService.tgNotifyNewTask", err);
        }
    }

    private async tgNotifyNewguide(guide: CGuide): Promise<void> {
        try {
            // отправляем тем, у кого включен параметр tg_guides
            const users = await this.dataSource.getRepository(CUser).find({where: {active: true, tg_id: Not(IsNull()), tg_active: true, tg_guides: true}, relations: ["lang"]});

            for (let user of users) {
                await this.appService.pause(1000); // не больше 30 сообщений в секунду, возьмем с запасом - 1 в секунду
                await this.tgBotService.userNewguide(user, guide);
            }
        } catch (err) {
            await this.errorsService.log("api.admin/CGuidesService.tgNotifyNewGuide", err);
        }
    }
}