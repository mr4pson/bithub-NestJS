import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CGuideNote } from "src/model/entities/guide.note";
import { DataSource } from "typeorm";
import { IGuideNoteSave } from "./dto/guide.note.save.interface";

@Injectable()
export class CGuideNotesService {
    constructor(
        private dataSource: DataSource,
        private errorsService: CErrorsService,
    ) {}    

    public async save(dto: IGuideNoteSave, user_id: number): Promise<IResponse<void>> {
        try {
            let guideNote = await this.dataSource.getRepository(CGuideNote).findOneBy({guide_id: dto.guide_id, user_id});

            if (guideNote) {
                guideNote.content = dto.content;
            } else {
                guideNote = this.dataSource.getRepository(CGuideNote).create({guide_id: dto.guide_id, user_id, content: dto.content});
            }

            await this.dataSource.getRepository(CGuideNote).save(guideNote);
            return {statusCode: 200};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CGuideNotesService.save", err);
            return {statusCode: 500, error};
        }
    }
}
