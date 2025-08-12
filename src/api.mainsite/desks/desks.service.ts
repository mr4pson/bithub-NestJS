import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CDesk, TDeskMode } from "src/model/entities/desk";
import { CUser } from "src/model/entities/user";
import { DataSource, MoreThan, Not } from "typeorm";
import { IDesk } from "./dto/desk.interface";
import { CProblem } from "src/model/entities/problem";
import * as util from "util";
import { CProblemComment } from "src/model/entities/problem.comment";

@Injectable()
export class CDesksService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}

    public async all(mode: TDeskMode, user_id: number): Promise<IResponse<IDesk[]>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            const owner_id = mode === "public" ? (user.parent_id || user_id) : user_id;
            const problemsFilter = mode === "public" && user.parent_id ? `problems.user_id='${user_id}'` : "";                        
            // тут я пока не придумал, как одним запросом сразу определить наличие непрочитанных каментов, поэтому по каждой задаче будет доп. запрос на наличие соотв. камента
            const desks = await this.dataSource
                .getRepository(CDesk)
                .createQueryBuilder("desks")
                .leftJoinAndSelect("desks.problems", "problems", problemsFilter)
                .leftJoinAndSelect("problems.guide", "guide")
                .leftJoinAndSelect("problems.user", "user")
                .leftJoinAndSelect("problems.viewings", "viewings", `viewings.user_id='${user_id}'`)                
                .where(`desks.user_id='${owner_id}' AND desks.mode='${mode}'`)
                .orderBy({"desks.pos": "ASC", "problems.created_at": "ASC"})
                .getMany();           
            const data: IDesk[] = [];
            
            for (let desk of desks) {                
                const d = await this.buildDesk(desk, user_id);
                data.push(d);
            }
            
            //console.log(util.inspect(desks, {showHidden: false, depth: null, colors: true}))
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDesksService.all", err);
            return {statusCode: 500, error};
        }
    }

    public async one(id: number, user_id: number): Promise<IResponse<IDesk>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (![user.id, user.parent_id].includes(desk.user_id)) return {statusCode: 401, error: "no permission to view desk"};
            let problemsFilter = `problems.desk_id='${desk.id}'`;
            
            if (desk.mode === "public" && user.parent_id) {
                problemsFilter += ` AND problems.user_id='${user_id}'`;
            }            
            
            desk.problems = await this.dataSource.getRepository(CProblem)
                .createQueryBuilder("problems")
                .leftJoinAndSelect("problems.guide", "guide")
                .leftJoinAndSelect("problems.user", "user")
                .leftJoinAndSelect("problems.viewings", "viewings", `viewings.user_id='${user_id}'`) 
                .where(problemsFilter)
                .orderBy({"problems.created_at": "ASC"})
                .getMany();
            const data = await this.buildDesk(desk, user_id);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDesksService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async update(dto: IDesk, user_id): Promise<IResponse<void>> {
        try {
            let desk = await this.dataSource.getRepository(CDesk).findOneBy({id: dto.id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to update"};
            desk = this.buildSafeUpdate(dto);
            await this.dataSource.getRepository(CDesk).save(desk);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDesksService.update", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number, user_id: number): Promise<IResponse<void>> {
        try {
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to delete"};
            await this.dataSource.getRepository(CDesk).remove(desk);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDesksService.delete", err);
            return {statusCode: 500, error};
        }
    }

    public async create(mode: TDeskMode, user_id: number): Promise<IResponse<IDesk>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            if (mode === "public" && user.parent_id) return {statusCode: 401, error: "no persmission to create"};
            const lastDesk = await this.dataSource.getRepository(CDesk).findOne({where: {mode, user_id}, order: {pos: -1}});
            const pos = lastDesk ? lastDesk.pos + 1 : 0;
            const desk = this.dataSource.getRepository(CDesk).create({user_id, mode, pos});
            await this.dataSource.getRepository(CDesk).save(desk);
            const data = await this.buildDesk(desk, user_id);
            return {statusCode: 201, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CDesksService.create", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////////
    // utils
    ///////////////////

    private async buildDesk(desk: CDesk, user_id: number): Promise<IDesk> {
        const data: IDesk = {
            id: desk.id,
            name: desk.name,
            problems: [], 
        };

        if (desk.problems) {
            for (let problem of desk.problems) {                
                const viewed_at = problem.viewings.length === 1 ? problem.viewings[0].viewed_at : new Date(null);
                // в принципе, тут можно посчитать и количество, но нас пока интересует только существование, так эффективнее, по идее
                const unviewedComment = await this.dataSource.getRepository(CProblemComment).findOne({where: {problem_id: problem.id, user_id: Not(user_id), created_at: MoreThan(viewed_at)}}); 
                const has_unviewed_comments = !!unviewedComment;
                data.problems.push({
                    id: problem.id, 
                    desk_id: problem.desk_id,
                    content: problem.content, 
                    actual_until: problem.actual_until,
                    created_at: problem.created_at,
                    has_unviewed_comments,
                    user: {id: problem.user.id, name: problem.user.name, img: problem.user.img}, 
                    guide: problem.guide ? {id: problem.guide.id, img: problem.guide.img} : null,                     
                });
            }
        }

        return data;
    }

    private buildSafeUpdate(dto: IDesk): CDesk {
        return this.dataSource.getRepository(CDesk).create({
            id: dto.id,
            name: dto.name,
        });
    }
}