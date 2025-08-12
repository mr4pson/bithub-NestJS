import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CGuide } from "src/model/entities/guide";
import { DataSource, In } from "typeorm";
import { IGuide } from "./dto/guide.interface";
import { CLang } from "src/model/entities/lang";
import { CAppService } from "src/common/services/app.service";
import { CGuideLink } from "src/model/entities/guide.link";
import { IGuideLink } from "./dto/guide.link.interface";
import { CTask } from "src/model/entities/task";
import { ITask } from "../tasks/dto/task.interface";
import { IFavoritionUpdate } from "./dto/favorition.update.interface";
import { CFavorition } from "src/model/entities/favorition";
import { CUser } from "src/model/entities/user";
import { CSocketGateway } from "src/socket/socket.gateway";
import { CUsersService } from "../users/users.service";
import { CCompletion } from "src/model/entities/completion";
import { ICompletion, ICompletionTask, ICompletionUser } from "./dto/completion.interface";
import * as util from "util";

@Injectable()
export class CGuidesService {
    constructor(
        protected errorsService: CErrorsService,
        protected appService: CAppService,
        protected dataSource: DataSource,
        protected socketGateway: CSocketGateway,
        protected usersService: CUsersService,
    ) {}

    public async chunk(dto: IGetList, user_id: number): Promise<IResponse<IGuide[]>> {
        try {
            const filter = await this.buildChunkFilter(dto.filter, user_id);
            const sortBy = `guides.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const preguides = await this.dataSource
                .getRepository(CGuide)
                .createQueryBuilder("guides")
                .addSelect("guides.price")
                .addSelect("guides.time")
                .leftJoin("guides.cat", "cat")
                .leftJoin("guides.translations", "translations")
                .leftJoin("guides.favoritions", "favoritions")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const ids = preguides.map(x => x.id);
            let query = this.dataSource
                .getRepository(CGuide)
                .createQueryBuilder("guides")
                .addSelect("guides.price")
                .addSelect("guides.time")
                .leftJoinAndSelect("guides.translations", "translations")
                .addSelect("translations.contentshort")
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir});
            let user: CUser = null;

            if (user_id) {
                user = await this.dataSource.getRepository(CUser).findOne({where: {id: user_id, active: true}});

                if (user) {
                    query = query
                        .leftJoinAndSelect("guides.tasks", "tasks")
                        .loadRelationCountAndMap("tasks.completions_count", "tasks.completions", "completions", qb => qb.where(`completions.user_id='${user_id}'`)) // отметки о выполнении тасков пользователем
                        .loadRelationCountAndMap("tasks.viewings_count", "tasks.viewings", "viewings", qb => qb.where(`viewings.user_id='${user_id}'`)) // отметки о просмотрах тасков пользователем
                        .loadRelationCountAndMap("guides.favoritions_count", "guides.favoritions", "favoritions", qb => qb.where(`favoritions.user_id='${user_id}'`)) // отметки о занесении в избранное
                }
            }

            const guides = await query.getMany();
            const elementsQuantity = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoin("guides.cat", "cat") // join to apply filter
                .leftJoin("guides.translations", "translations") // join to apply filter
                .leftJoin("guides.favoritions", "favoritions") // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = guides.map(g => this.buildGuideMin(g, langs, user));
            //console.log(util.inspect(data[0], {showHidden: false, depth: null, colors: true}))
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    // гайды для статистики - те, в которых есть прогресс у запрашивающего либо его потомков
    public async statChunk(dto: IGetList, user_id: number): Promise<IResponse<IGuide[]>> {
        try {
            const user_ids = await this.getUsersWithProgress(user_id); // среди запрашивающего и потомков выбираем ID юзеров, у которых есть прогресс
            if (!user_ids.length) return {statusCode: 200, data: []}; // нет юзеров с прогрессом?
            const sortBy = `guides.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const now = this.appService.mysqlDate(new Date(), "datetime");
            const filter = this.buildStatChunkFilter(dto.filter, user_ids, user_id);
            // из-за фильтрации по присоединенной таблице translations будем делать выборку в два этапа,
            // сначала найдем id с учетом фильтра, потом полные объекты из id без фильтра,
            // иначе в выборку не попадут присоединенные translations, не отвечающие фильтру
            const preguides = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoin("guides.translations", "translations")
                .leftJoin("guides.favoritions", "favoritions")
                .leftJoin("guides.tasks", "tasks")
                .leftJoin("tasks.completions", "completions")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            //console.log(util.inspect(preguides, {showHidden: false, depth: null, colors: true}));
            const ids = preguides.map(x => x.id);
            const guides = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .addSelect("guides.price")
                .leftJoinAndSelect("guides.translations", "translations")
                .leftJoinAndSelect("guides.notes", "notes", `notes.user_id='${user_id}'`)
                .whereInIds(ids)
                .orderBy({[sortBy]: sortDir})
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                // join to apply filter
                .leftJoin("guides.translations", "translations")
                .leftJoin("guides.favoritions", "favoritions")
                .leftJoin("guides.tasks", "tasks")
                .leftJoin("tasks.completions", "completions")
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = guides.map(g => this.buildGuideStat(g, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.statChunk", err);
            return {statusCode: 500, error};
        }
    }

    // прогресс гайда по юзерам (запрашивающий и его потомки)
    public async statCompletions(guide_id: number, user_id: number): Promise<IResponse<ICompletion[]>> {
        try {
            const users = await this.dataSource
                .getRepository(CUser)
                .createQueryBuilder("users")
                .where(`(users.id='${user_id}' OR users.parent_id='${user_id}') AND users.active='1'`)
                .orderBy({"users.id": "ASC"})
                .getMany();
            const user_ids = users.map(u => u.id);
            const now = this.appService.mysqlDate(new Date(), "datetime");
            const tasks = await this.dataSource
                .getRepository(CTask)
                .createQueryBuilder("tasks")
                .where(`tasks.guide_id='${guide_id}'`)
                .orderBy({"tasks.pos": "ASC"})
                .getMany();
            const task_ids = tasks.map(t => t.id);
            const completions = await this.dataSource.getRepository(CCompletion).find({where: {user_id: In(user_ids), task_id: In(task_ids)}});
            const data = this.buildCompletions(users, tasks, completions);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.statCompletions", err);
            return {statusCode: 500, error};
        }
    }

    public async favoritesChunk(dto: IGetList, user_id: number): Promise<IResponse<IGuide[]>> {
        try {
            const sortBy = `guides.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const filter = await this.buildFavoritesChunkFilter(user_id);
            const guides = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .addSelect("guides.time")
                .addSelect("guides.price")
                .leftJoinAndSelect("guides.translations", "translations")
                .leftJoinAndSelect("guides.cat", "cat")
                .leftJoin("guides.favoritions", "favoritions")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .leftJoin("guides.favoritions", "favoritions") // join to apply filter
                .leftJoinAndSelect("guides.cat", "cat")  // join to apply filter
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = guides.map(g => this.buildGuideFavorite(g, langs));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.favoritesChunk", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number, user_id: number): Promise<IResponse<IGuide>> {
        try {
            // to sort joined array we need to use QueryBuilder instead of simple repository API!
            let filter = `guides.id='${id}' AND guides.active='1'`;
            if (!await this.usersService.canSeePaidContent(user_id)) filter += ` AND cat.paid = '0'`;
            const guide = await this.dataSource.getRepository(CGuide)
                .createQueryBuilder("guides")
                .addSelect("guides.price")
                .addSelect("guides.time")
                .leftJoinAndSelect("guides.cat", "cat")
                .leftJoinAndSelect("guides.translations", "translations")
                .addSelect("translations.content")
                .leftJoinAndSelect("guides.links", "links")
                .leftJoinAndSelect("links.type", "link_type")
                .leftJoinAndSelect("guides.tasks", "tasks")
                .leftJoinAndSelect("tasks.translations", "task_translations")
                .loadRelationCountAndMap("tasks.completions_count", "tasks.completions", "completions", qb => qb.where(`completions.user_id='${user_id}'`)) // отметки о выполнении тасков пользователем
                .loadRelationCountAndMap("guides.favoritions_count", "guides.favoritions", "favoritions", qb => qb.where(`favoritions.user_id='${user_id}'`)) // отметки о занесении в избранное
                .where(filter)
                .orderBy({
                    "links.pos": "ASC",
                    "tasks.pos": "ASC",
                })
                .getOne();

            if (!guide) {
                return {statusCode: 404, error: "guide not found"}
            }

            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});
            const data = this.buildGuideFull(guide, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async updateFavorition(dto: IFavoritionUpdate, user_id: number): Promise<IResponse<void>> {
        try {
            if (dto.favorited) {
                const favorition = this.dataSource.getRepository(CFavorition).create({user_id, guide_id: dto.guide_id});
                await this.dataSource.getRepository(CFavorition).save(favorition);
            } else {
                await this.dataSource.getRepository(CFavorition).delete({user_id, guide_id: dto.guide_id});
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.updateFavorition", err);
            return {statusCode: 500, error};
        }
    }

    /*
    public async updateReminder(dto: IReminderUpdate, user_id: number): Promise<IResponse<void>> {
        try {
            if (dto.remind_at) {
                let reminder = await this.dataSource.getRepository(CReminder).findOne({where: {user_id, guide_id: dto.guide_id}});

                if (reminder) {
                    reminder.remind_at = dto.remind_at;
                } else {
                    reminder = this.dataSource.getRepository(CReminder).create({user_id, guide_id: dto.guide_id, remind_at: dto.remind_at});
                }

                await this.dataSource.getRepository(CReminder).save(reminder);
            } else {
                await this.dataSource.getRepository(CReminder).delete({user_id, guide_id: dto.guide_id});
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.updateReminder", err);
            return {statusCode: 500, error};
        }
    }

    public async updateExecution(dto: IExecutionUpdate, user_id: number): Promise<IResponse<void>> {
        try {
            if (dto.executed_at) {
                let execution = await this.dataSource.getRepository(CExecution).findOne({where: {user_id, guide_id: dto.guide_id}});

                if (execution) {
                    execution.executed_at = dto.executed_at;
                } else {
                    execution = this.dataSource.getRepository(CExecution).create({user_id, guide_id: dto.guide_id, executed_at: dto.executed_at});
                }

                await this.dataSource.getRepository(CExecution).save(execution);
            } else {
                await this.dataSource.getRepository(CExecution).delete({user_id, guide_id: dto.guide_id});
            }

            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuidesService.updateExecution", err);
            return {statusCode: 500, error};
        }
    }
        */

    ///////////////////
    // utils
    ///////////////////

    private async buildChunkFilter(dtoFilter: any, user_id: number): Promise<string> {
        let filter = "guides.active = '1'";

        if (!await this.usersService.canSeePaidContent(user_id)) {
            filter += ` AND cat.paid = '0'`;
        }

        if (dtoFilter.search) {
            filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%')`;
        }

        if (dtoFilter.cat_id !== undefined) {
            if (dtoFilter.cat_id === null) {
                filter += ` AND guides.cat_id IS NULL`;
            } else {
                filter += ` AND guides.cat_id = '${dtoFilter.cat_id}'`;
            }
        }

        if (dtoFilter.created_at_less) {
            filter += ` AND guides.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        if (dtoFilter.status) {
            filter += ` AND guides.status = '${dtoFilter.status}'`;
        }

        if (dtoFilter.earnings) {
            filter += ` AND guides.earnings = '${dtoFilter.earnings}'`;
        }

        if (user_id && dtoFilter.favorites) {
            filter += ` AND favoritions.user_id='${user_id}'`;
        }

        return filter;
    }

    private async buildFavoritesChunkFilter(user_id: number): Promise<string> {
        let filter = `guides.active='1' AND favoritions.user_id='${user_id}'`;
        if (!await this.usersService.canSeePaidContent(user_id)) filter += ` AND cat.paid = '0'`;
        return filter;
    }

    private buildStatChunkFilter(dtoFilter: any, user_ids: number[], user_id: number): string {
        let filter = `guides.active='1' AND completions.user_id IN (${user_ids.toString()})`;

        if (dtoFilter.favorites) {
            filter += ` AND favoritions.user_id='${user_id}'`;
        }

        if (dtoFilter.search) {
            filter += ` AND LOWER(translations.name) LIKE LOWER('%${dtoFilter.search}%')`;
        }

        return filter;
    }

    private buildGuideMin(guide: CGuide, langs: CLang[], user: CUser): IGuide {
        const data: IGuide = {
            id: guide.id,
            img: guide.img,
            invest: guide.invest,
            bh_score: guide.bh_score,
            name: {},
            contentshort: {},
            earnings: guide.earnings,
            price: guide.price,
            time: guide.time,
            hit: guide.hit,
            status: guide.status,
            favorited: false,
            progress: 0,
            has_unviewed: false,
        };

        if (user) {
            data.favorited = guide["favoritions_count"] === 1;
            data.progress = guide.tasks?.length ? parseFloat((guide.tasks.filter(t => t.type === "main" && t["completions_count"] === 1).length * 100 / guide.tasks.filter(t => t.type === "main").length).toFixed(1)) : 0;
            data.has_unviewed = !!guide.tasks?.filter(t => t.created_at.getTime() > user.created_at.getTime() && !t["viewings_count"]).length
        }

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.contentshort[l.slug] = t.contentshort;
        }

        return data;
    }

    private buildGuideFavorite(guide: CGuide, langs: CLang[]): IGuide {
        const data: IGuide = {
            id: guide.id,
            img: guide.img,
            name: {},
            earnings: guide.earnings,
            price: guide.price,
            time: guide.time,
        };

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildGuideFull(guide: CGuide, langs: CLang[]): IGuide {
        const now = new Date();
        const data: IGuide = {
            id: guide.id,
            img: guide.img,
            invest: guide.invest,
            bh_score: guide.bh_score,
            name: {},
            content: {},
            earnings: guide.earnings,
            price: guide.price,
            time: guide.time,
            status: guide.status,
            created_at: guide.created_at,
            favorited: guide["favoritions_count"] === 1,
            progress: guide.tasks?.length ? parseFloat((guide.tasks.filter(t => t.type === "main" && t["completions_count"] === 1).length * 100 / guide.tasks.filter(t => t.type === "main").length).toFixed(1)) : 0,
            links: guide.links.map(l => this.buildGuideLink(l)),
            tasks: guide.tasks.map(t => this.buildTask(t, langs, now)),
        };

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.content[l.slug] = t.content;
        }

        return data;
    }

    private buildGuideStat(guide: CGuide, langs: CLang[]): IGuide {
        const data: IGuide = {
            id: guide.id,
            img: guide.img,
            name: {},
            note: guide.notes[0]?.content || "",
        };

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    private buildCompletions(users: CUser[], tasks: CTask[], completions: CCompletion[]): ICompletion[] {
        const data: ICompletion[] = [];

        for (let user of users) {
            const completionTasks: ICompletionTask[] = tasks.map(task => ({
                task_id: task.id,
                task_type: task.type,
                completed: !!completions.find(c => c.user_id === user.id && c.task_id === task.id),
            }));
            if (!completionTasks.filter(t => t.completed).length) continue; // если этот пользователь не участвовал в прогрессе - пропускаем
            const completionUser: ICompletionUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                wallet: user.wallet,
            };
            const qMainTasks = completionTasks.filter(t => t.task_type === "main").length;
            const qCompletedMainTasks = completionTasks.filter(t => t.task_type === "main" && t.completed).length;
            const completionProgress = parseFloat((qCompletedMainTasks * 100 / qMainTasks).toFixed(1));
            data.push({user: completionUser, progress: completionProgress, tasks: completionTasks});
        }

        return data;
    }

    private buildGuideLink(link: CGuideLink): IGuideLink {
        return {
            id: link.id,
            value: link.value,
            img: link.type?.img,
            name: link.type?.name,
        };
    }

    private buildTask(task: CTask, langs: CLang[], now: Date): ITask {
        const data: ITask = {
            id: task.id,
            guide_id: task.guide_id,
            type: task.type,
            contenttype: task.contenttype,
            name: {},
            completed: task["completions_count"] === 1,
            actual_until: task.actual_until,
            actual: task.actual_until ? task.actual_until.getTime() > now.getTime() : true,
            created_at: task.created_at,
        };

        for (let l of langs) {
            const t = task.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }

    // среди запрашивающего и его потомков выбираем ID юзеров, у которых есть прогресс
    private async getUsersWithProgress(user_id): Promise<number[]> {
        const q = `
            SELECT *
            FROM (
                SELECT u.id, (SELECT COUNT(*) FROM a7_completions AS c WHERE u.id=c.user_id) as completions_count
                FROM a7_users AS u
                WHERE (u.id='${user_id}' OR u.parent_id='${user_id}') AND u.active='1'
            ) AS x
            WHERE x.completions_count!='0'
        `;
        const userIds = (await this.dataSource.query(q)).map(x => x.id) as number[];
        return userIds;
    }
}