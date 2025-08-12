import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IGetList } from "src/model/dto/getlist.interface";
import { IResponse } from "src/model/dto/response.interface";
import { CProblemComment } from "src/model/entities/problem.comment";
import { CUser } from "src/model/entities/user";
import { DataSource } from "typeorm";
import { CProblem } from "src/model/entities/problem";
import { CAppService } from "src/common/services/app.service";
import { IProblemComment } from "./dto/problem.comment.interface";
import { CSocketGateway } from "src/socket/socket.gateway";
import { IProblemCommentCreate } from "./dto/problem.comment.create";

@Injectable()
export class CProblemCommentsService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
        private appService: CAppService,
        private socketGateway: CSocketGateway,
    ) {}

    public async chunk(dto: IGetList, user_id: number): Promise<IResponse<IProblemComment[]>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            const problem = await this.dataSource.getRepository(CProblem).findOne({where: {id: dto.filter.problem_id}, relations: ["desk"]});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            if (![user.id, user.parent_id].includes(problem.desk.user_id)) return {statusCode: 401, error: "no permissions to view comments"};
            const filter = this.buildFilter(dto.filter);
            const sortBy = `comments.${dto.sortBy}`;
            const sortDir = dto.sortDir === 1 ? "ASC" : "DESC";
            const comments = await this.dataSource.getRepository(CProblemComment)
                .createQueryBuilder("comments")
                .leftJoinAndSelect("comments.user", "user")
                .where(filter)
                .orderBy({[sortBy]: sortDir})
                .take(dto.q)
                .skip(dto.from)
                .getMany();
            const elementsQuantity = await this.dataSource.getRepository(CProblemComment)
                .createQueryBuilder("comments")                
                .where(filter)
                .getCount();
            const pagesQuantity = Math.ceil(elementsQuantity / dto.q);
            const data = comments.map(m => this.buildProblemComment(m));
            return {statusCode: 200, data, elementsQuantity, pagesQuantity};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemCommentsService.chunk", err);
            return {statusCode: 500, error};
        }
    }

    public async create(dto: IProblemCommentCreate, user_id: number): Promise<IResponse<void>> {
        try {
            const user = await this.dataSource.getRepository(CUser).findOneBy({id: user_id});
            const problem = await this.dataSource.getRepository(CProblem).findOne({where: {id: dto.problem_id}, relations: ["desk"]});
            if (!problem) return {statusCode: 404, error: "problem not found"};
            if (![user.id, user.parent_id].includes(problem.desk.user_id)) return {statusCode: 401, error: "no permissions to view comments"};
            let comment = this.dataSource.getRepository(CProblemComment).create({user_id, problem_id: dto.problem_id, content: dto.content?.substring(0, 1000)});
            await this.dataSource.getRepository(CProblemComment).save(comment);
            comment = await this.dataSource.getRepository(CProblemComment).findOne({where: {id: comment.id}, relations: ["user"]});
            this.socketGateway.broadcast({event: "problem-comment", data: this.buildProblemComment(comment)});
            return {statusCode: 201};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CProblemCommentsService.create", err);
            return {statusCode: 500, error};
        }
    }

    ////////////////
    // utils
    ////////////////

    private buildFilter(dtoFilter: any): string {
        let filter = "TRUE";

        if (dtoFilter.problem_id) {
            filter += ` AND comments.problem_id = '${dtoFilter.problem_id}'`;
        }

        if (dtoFilter.created_at_less !== undefined) {
            filter += ` AND comments.created_at <= '${this.appService.mysqlDate(new Date(dtoFilter.created_at_less), "datetime")}'`;
        }

        return filter;
    }

    private buildProblemComment(comment: CProblemComment): IProblemComment {
        return {
            id: comment.id,
            problem_id: comment.problem_id,
            user_id: comment.user_id,
            user_name: comment.user?.name,
            user_img: comment.user?.img,
            content: comment.content?.replace(/\n/g, "<br>"),
            created_at: comment.created_at,
        };
    }
}