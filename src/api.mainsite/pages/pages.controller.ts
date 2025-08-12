import { Controller, Param, Post } from "@nestjs/common";
import { IResponse } from 'src/model/dto/response.interface';
import { CPagesService } from "./pages.service";
import { IPage } from "./dto/page.interface";

@Controller('api/mainsite/pages')
export class CPagesController {
    constructor (private pagesService: CPagesService) {}        

    @Post("menu-main")
    public menuMain(): Promise<IResponse<IPage[]>> {
        return this.pagesService.menuMain();
    }

    @Post("menu-foot")
    public menuFoot(): Promise<IResponse<IPage[]>> {
        return this.pagesService.menuFoot();
    }
    
    @Post("one/:slug")
    public one(@Param("slug") slug: string): Promise<IResponse<IPage>> {
        return this.pagesService.one(slug);
    }
}
