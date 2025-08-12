import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { CProblem } from "src/model/entities/problem";
import { DataSource } from "typeorm";
import { IResponse } from "src/model/dto/response.interface";
import { IProblemCreate } from "./dto/problem.create.interface";
import { CDesk } from "src/model/entities/desk";
import { IProblem, IProblemGuide, IProblemTask } from "./dto/problem.interface";
import { CUser } from "src/model/entities/user";
import { CLang } from "src/model/entities/lang";
import { CGuide } from "src/model/entities/guide";
import { CTask } from "src/model/entities/task";
import { IProblemUpdate } from "./dto/problem.update.interface";
import { CProblemViewing } from "src/model/entities/problem.viewing";
import { IProblemUpdateDesk } from "./dto/problem.update.desk.interface";

@Injectable()
export class CProblemsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}
    
    public async create(dto: IProblemCreate, user_id: number): Promise<IResponse<void>> {
        try {
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: dto.desk_id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to create problem"};
            const problem = this.buildSafeCreate(dto);
            await this.dataSource.getRepository(CProblem).save(problem);
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.create", err);
            return {statusCode: 500, error};
        }
    }

    public async update(dto: IProblemUpdate, user_id: number): Promise<IResponse<void>> {
        try {
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: dto.desk_id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to update problem"};
            const problem = this.buildSafeUpdate(dto);
            await this.dataSource.getRepository(CProblem).save(problem);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.update", err);
            return {statusCode: 500, error};
        }
    }

    // обновление даты просмотра
    public async updateViewing(id: number, user_id: number): Promise<IResponse<void>> {
        try {
            const problem = await this.dataSource.getRepository(CProblem).findOne({where: {id}, relations: ["desk"]});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            if (![user.id, user.parent_id].includes(problem.desk.user_id)) return {statusCode: 401, error: "no permission to view"};
            await this.saveViewing(id, user_id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.updateViewing", err);
            return {statusCode: 500, error};
        }
    }

    // смена доски
    public async updateDesk(dto: IProblemUpdateDesk, user_id: number): Promise<IResponse<void>> {
        try {
            const problem = await this.dataSource.getRepository(CProblem).findOne({where: {id: dto.problem_id}, relations: ["desk"]});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            if (![user.id, user.parent_id].includes(problem.desk.user_id)) return {statusCode: 401, error: "no permission to move this problem"};
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: dto.desk_id});
            if (!desk) return {statusCode: 404, error: "desk not found"};
            if (![user.id, user.parent_id].includes(desk.user_id)) return {statusCode: 401, error: "no permission to move to this desk"};
            problem.desk_id = dto.desk_id;            
            await this.dataSource.getRepository(CProblem).update({id: dto.problem_id}, {desk_id: dto.desk_id}); // я не беру problem, потому что в нем мешается присоединенный объект desk
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.updateDesk", err);
            return {statusCode: 500, error};
        }
    }

    public async oneViewable(id: number, user_id: number): Promise<IResponse<IProblem>> {
        try {
            const problem = await this.dataSource.getRepository(CProblem).findOne({where: {id}, relations: ["guide", "guide.translations", "task", "task.translations", "user"]});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: problem.desk_id});
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            if (![user.id, user.parent_id].includes(desk.user_id)) return {statusCode: 401, error: "no permission to view"};
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});   
            const data = this.buildViewableProblem(problem, langs);
            await this.saveViewing(id, user_id); // сохраняем время просмотра (для дальнейшего определения наличия новых каментов), в основном из-за этого и были разделены методы загрузки для просмотра и для редактирования
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.oneViewable", err);
            return {statusCode: 500, error};
        }
    }

    public async oneEditable(id: number, user_id: number): Promise<IResponse<IProblem>> {
        try {
            const problem = await this.dataSource.getRepository(CProblem).findOneBy({id});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: problem.desk_id});
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to edit"};
            const data = this.buildEditableProblem(problem);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.oneEditable", err);
            return {statusCode: 500, error};
        }
    }

    public async delete(id: number, user_id: number): Promise<IResponse<void>> {
        try {
            const problem = await this.dataSource.getRepository(CProblem).findOneBy({id});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            const desk = await this.dataSource.getRepository(CDesk).findOneBy({id: problem.desk_id});
            if (!desk) return {statusCode: 404, error: "desk not found"};  
            if (desk.user_id !== user_id) return {statusCode: 401, error: "no permission to delete problem"};
            await this.dataSource.getRepository(CProblem).delete(id);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemsService.delete", err);
            return {statusCode: 500, error};
        }
    }

    //////////////////
    // utils
    //////////////////

    private async saveViewing(problem_id: number, user_id: number): Promise<void> {
        let viewing = await this.dataSource.getRepository(CProblemViewing).findOne({where: {problem_id, user_id}});

        if (viewing) {
            viewing.viewed_at = new Date();
        } else {
            viewing = this.dataSource.getRepository(CProblemViewing).create({problem_id, user_id, viewed_at: new Date()});
        }

        await this.dataSource.getRepository(CProblemViewing).save(viewing);
    }

    private buildViewableProblem(problem: CProblem, langs: CLang[]): IProblem {
        const data: IProblem = {
            id: problem.id,
            desk_id: problem.desk_id,
            user_id: problem.user_id,
            guide_id: problem.guide_id,
            task_id: problem.task_id,
            content: problem.content,
            actual_until: problem.actual_until,
            created_at: problem.created_at,
            user: {
                id: problem.user.id,
                name: problem.user.name,
                img: problem.user.img,
            },
            guide: problem.guide ? this.buildGuide(problem.guide, langs) : null,
            task: problem.task ? this.buildTask(problem.task, langs) : null,
        };

        return data;
    }

    private buildEditableProblem(problem: CProblem): IProblem {
        const data: IProblem = {
            id: problem.id,
            desk_id: problem.desk_id,
            user_id: problem.user_id,
            guide_id: problem.guide_id,
            task_id: problem.task_id,
            content: problem.content,
            actual_until: problem.actual_until,
            created_at: problem.created_at,            
        };

        return data;
    }

    private buildGuide(guide: CGuide, langs: CLang[]): IProblemGuide {
        const data: IProblemGuide = {
            id: guide.id,
            img: guide.img,
            name: {},
        }

        for (let l of langs) {
            const t = guide.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;            
        }

        return data;
    }

    private buildTask(task: CTask, langs: CLang[]): IProblemTask {
        const data: IProblemTask = {
            id: task.id,
            name: {},
        }

        for (let l of langs) {
            const t = task.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;            
        }

        return data;
    }

    private buildSafeCreate(dto: IProblemCreate): CProblem {
        return this.dataSource.getRepository(CProblem).create({
            desk_id: dto.desk_id,
            user_id: dto.user_id,
            guide_id: dto.guide_id,
            task_id: dto.task_id,
            content: dto.content,
            actual_until: dto.actual_until,
        });        
    } 
    
    private buildSafeUpdate(dto: IProblemUpdate): CProblem {
        return this.dataSource.getRepository(CProblem).create({
            id: dto.id,
            desk_id: dto.desk_id,
            user_id: dto.user_id,
            guide_id: dto.guide_id,
            task_id: dto.task_id,
            content: dto.content,
            actual_until: dto.actual_until,
        });        
    } 
}