import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CGuideNotesService } from "./guide.notes.service";
import { JwtService } from "@nestjs/jwt";
import { CUserGuard } from "src/common/services/guards/user.guard";
import { IResponse } from "src/model/dto/response.interface";
import { IGuideNoteSave } from "./dto/guide.note.save.interface";

@Controller('api/mainsite/guide-notes')
export class CGuideNotesController {
    constructor (
        private guideNotesService: CGuideNotesService,
        private jwtService: JwtService,
    ) {}     

    @UseGuards(CUserGuard)
    @Post("save")
    public save(@Body() dto: IGuideNoteSave, @Req() request: Request): Promise<IResponse<void>> {
        const token = request.headers["token"] as string;
        const visitor_id = this.jwtService.decode(token)["id"] as number;
        return this.guideNotesService.save(dto, visitor_id);
    }
}
