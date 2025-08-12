import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CLang } from "src/model/entities/lang";
import { CTask } from "src/model/entities/task";
import { DataSource, In, MoreThan } from "typeorm";
import { ITask } from "./dto/task.interface";
import { CCompletion } from "src/model/entities/completion";
import { ICompletionUpdate } from "./dto/completion.update.interface";
import { CUser } from "src/model/entities/user";
import { CSetting } from "src/model/entities/setting";
import { CViewing } from "src/model/entities/viewing";
import { IGetList } from "src/model/dto/getlist.interface";
import { CAppService } from "src/common/services/app.service";
import { CGuide } from "src/model/entities/guide";
import { IViewed } from "./dto/viewed.interface";
import { IGuide } from "../guides/dto/guide.interface";
import { CUsersService } from "../users/users.service";

@Injectable()
export class CTasksService {
    constructor(
        private errorsService: CErrorsService,
        private appService: CAppService,
        private dataSource: DataSource,
        protected usersService: CUsersService,
    ) {}

    // непросмотренные таски
    public async unviewedChunk(dto: IGetList, user_id: number): Promise<IResponse<ITask[]>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id}});
            const filter = await this.buildUnviewedChunkFilter(dto.filter, user);
            const sortBy = `t.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const query1 = `
                SELECT t.id, COUNT(v.id) AS viewings_count
                FROM a7_tasks AS t
                LEFT JOIN a7_viewings AS v ON v.task_id=t.id AND v.user_id='${user_id}'
                LEFT JOIN a7_guides AS g ON g.id=t.guide_id
                LEFT JOIN a7_cats AS c ON c.id=g.cat_id
                LEFT JOIN a7_favoritions AS f ON f.guide_id=g.id
                WHERE ${filter}
                GROUP BY t.id
                HAVING viewings_count='0'
            `;
            const query2 = `${query1} ORDER BY ${sortBy} ${sortDir} LIMIT ${dto.q} OFFSET ${dto.from}`;
            const pretasks = await this.dataSource.query(query2) as CTask[];
            const task_ids = pretasks.map(t => t.id);
            const tasks = await this.dataSource.getRepository(CTask).find({where: {id: In(task_ids)}, relations: ["translations", "guide", "guide.translations"]});
            const query3 =  `SELECT COUNT(*) AS count FROM (${query1}) AS x`;
            const elementsQuantity = (await this.dataSource.query(query3))[0]["count"];
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const now = new Date();
            const data = tasks.map(t => this.buildUnviewedTask(t, langs, now));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.unviewedChunk", err);
            return {statusCode: 500, error};
        }
    }

    // количество непросмотренных тасков
    public async unviewedQuantity(favorites: boolean, user_id: number): Promise<IResponse<number>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id}});
            const filter = await this.buildUnviewedQuantityFilter(favorites, user);
            const query = `
                SELECT COUNT(*) AS count
                FROM (
                    SELECT t.id, COUNT(v.id) AS viewings_count
                    FROM a7_tasks AS t
                    LEFT JOIN a7_viewings AS v ON v.task_id=t.id AND v.user_id='${user_id}'
                    LEFT JOIN a7_guides AS g ON g.id=t.guide_id
                    LEFT JOIN a7_cats AS c ON c.id=g.cat_id
                    LEFT JOIN a7_favoritions AS f ON f.guide_id=g.id
                    WHERE ${filter}
                    GROUP BY t.id
                    HAVING viewings_count='0'
                ) AS x
            `;
            const data = parseInt((await this.dataSource.query(query))[0]["count"]);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.unviewedQuantity", err);
            return {statusCode: 500, error};
        }
    }

    // отметить как просмотренные
    public async viewed(dto: IViewed, user_id: number): Promise<IResponse<number[]>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id}});
            const filter = this.buildViewedFilter(dto, user_id);
            const now = this.appService.mysqlDate(new Date(), "datetime");
            const guides = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoinAndSelect("guides.tasks", "tasks", `tasks.created_at > '${this.appService.mysqlDate(user.created_at)}'`)
                .leftJoin("guides.favoritions", "favoritions")
                .where(filter)
                .getMany();
            let newViewings: CViewing[] = []; // создаваемые просмотры

            for (let guide of guides) {
                const existedViewings = await this.dataSource.getRepository(CViewing).find({where: {user_id, task_id: In(guide.tasks.map(t => t.id))}});

                for (let task of guide.tasks) {
                    if (existedViewings.find(v => v.task_id === task.id)) continue;
                    newViewings.push(this.dataSource.getRepository(CViewing).create({user_id, task_id: task.id}));
                }
            }

            await this.dataSource.getRepository(CViewing).save(newViewings);
            // возвращаем id "просмотренных" гайдов
            const data = guides.map(g => g.id);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.unviewedViewed", err);
            return {statusCode: 500, error};
        }
    }

    // платный контент таска
    public async paidOne(id: number, user_id: number): Promise<IResponse<ITask>> {
        try {
            const task = await this.dataSource.getRepository(CTask)
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.translations", "translations")
                .addSelect("translations.content")
                .addSelect("task.yt_content")
                .where(`task.id='${id}'`)
                .getOne();

            if (!task) return {
                statusCode: 404, error: "task not found"
            };

            let user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id, active: true}, relations: ["parent"]});

            if (!user) return {
                statusCode: 404, error: "user not found"
            };

            let errorCode = 409; // код отсутствия подписки для обычного пользователя

            // для субаккаунтов все лимиты рассчитываются для родительского аккаунта, код ошибки другой
            if (user.parent) {
                user = user.parent;
                errorCode = 410;
            }

            const now = new Date();

            // проверка на подписку и лимит бесплатных просмотров
            if (!user.paid_until || user.paid_until.getTime() < now.getTime()) {
                const freeLimit = (await this.dataSource.getRepository(CSetting).findOneBy({p: "site-freetasks"}))?.v;
                if (!freeLimit) return {statusCode: 404, error: "setting not found"};
                if (user.freetasks + 1 > parseInt(freeLimit)) return {statusCode: errorCode, error: "no subscription and free task views limit exceeded"};
                user.freetasks++;
                user.freetask_viewed_at = new Date();
                await this.dataSource.getRepository(CUser).save(user);
            }

            // записываем факт просмотра
            let viewing = await this.dataSource.getRepository(CViewing).findOneBy({user_id, task_id: task.id});

            if (!viewing) {
                viewing = this.dataSource.getRepository(CViewing).create({user_id, task_id: task.id});
                await this.dataSource.getRepository(CViewing).save(viewing);
            }

            // строим таск
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = this.buildPaidOneTask(task, langs, now);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.paidOne", err);
            return {statusCode: 500, error};
        }
    }

    // краткий таск
    public async one(id: number): Promise<IResponse<ITask>> {
        try {
            const task = await this.dataSource.getRepository(CTask).findOne({where: {id}, relations: ["translations"]});
            if (!task) return {statusCode: 404, error: "task not found"};
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const now = new Date();
            const data = this.buildOneTask(task, langs, now);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.one", err);
            return {statusCode: 500, error};
        }
    }

    // изменение статуса выполнения таска юзером
    public async updateCompletion(dto: ICompletionUpdate, user_id: number): Promise<IResponse<void>> {
        try {
            if (dto.completed) {
                const completions = await this.dataSource.getRepository(CCompletion).find({where: {user_id, task_id: dto.task_id}});

                if (!completions.length) {
                    const completion = this.dataSource.getRepository(CCompletion).create({user_id, task_id: dto.task_id});
                    await this.dataSource.getRepository(CCompletion).save(completion);
                }
            } else {
                await this.dataSource.getRepository(CCompletion).delete({user_id, task_id: dto.task_id});
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CTasksService.updateCompletion", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////////
    // utils
    //////////////////

    private async buildUnviewedChunkFilter(dtoFilter: any, user: CUser): Promise<string> {
        let filter = `
            t.created_at > '${this.appService.mysqlDate(user.created_at)}' AND
            g.active='1'
        `;

        if (!await this.usersService.canSeePaidContent(user.id)) {
            filter += ` AND c.paid = '0'`;
        }

        if (dtoFilter.guide_id) {
            filter += ` AND t.guide_id='${dtoFilter.guide_id}'`;
        }

        if (dtoFilter.created_at_less) {
            filter += ` AND t.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        if (dtoFilter.favorites) {
            filter += ` AND f.user_id='${user.id}'`;
        }

        return filter;
    }

    private async buildUnviewedQuantityFilter(favorites: boolean, user: CUser): Promise<string> {
        let filter = `
            t.created_at > '${this.appService.mysqlDate(user.created_at)}' AND
            g.active='1'`;

        if (!await this.usersService.canSeePaidContent(user.id)) {
            filter += ` AND c.paid = '0'`;
        }

        if (favorites) {
            filter += ` AND f.user_id='${user.id}'`;
        }

        return filter;
    }

    private buildViewedFilter(dto: IViewed, user_id: number): string {
        let filter = `guides.active='1'`;

        if (dto.guide_id) { // в этом случае просто один гайд
            filter += ` AND guides.id='${dto.guide_id}'`;
        }

        if (dto.favorites) {
            filter += ` AND favoritions.user_id='${user_id}'`;
        }

        return filter;
    }

    private buildOneTask(task: CTask, langs: CLang[], now: Date): ITask {
        const data: ITask = {
            id: task.id,
            guide_id: task.guide_id,
            name: {},
            actual: task.actual_until ? task.actual_until.getTime() > now.getTime() : true,
        };

        for (let l of langs) {
            const t = task.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildPaidOneTask(task: CTask, langs: CLang[], now: Date): ITask {
        const data: ITask = {
            id: task.id,
            guide_id: task.guide_id,
            price: task.price,
            time: task.time,
            contenttype: task.contenttype,
            content: task.contenttype === "html" ? {} : null,
            yt_content: task.contenttype === "yt" ? task.yt_content : null,
            actual_until: task.actual_until,
            actual: task.actual_until ? task.actual_until.getTime() > now.getTime() : true,
            created_at: task.created_at,
        };

        if (task.contenttype === "html") {
            for (let l of langs) {
                const t = task.translations.find(t => t.lang_id === l.id);
                data.content[l.slug] = t.content;
            }
        }

        return data;
    }

    private buildUnviewedTask(task: CTask, langs: CLang[], now: Date): ITask {
        const data: ITask = {
            id: task.id,
            guide_id: task.guide_id,
            price: task.price,
            time: task.time,
            type: task.type,
            actual_until: task.actual_until,
            actual: task.actual_until ? task.actual_until.getTime() > now.getTime() : true,
            name: {},
            guide: this.buildGuide(task.guide, langs),
        };

        for (let l of langs) {
            const t = task.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildGuide(guide: CGuide, langs: CLang[]): IGuide {
        const data: IGuide = {
            id: guide.id,
            name: {},
        };

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }
}