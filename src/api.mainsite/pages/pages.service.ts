import { Injectable } from "@nestjs/common";
import { IResponse } from "src/model/dto/response.interface";
import { CLang } from "src/model/entities/lang";
import { CPage } from "src/model/entities/page";
import { DataSource, IsNull } from "typeorm";
import { IPage } from "./dto/page.interface";
import { CAppService } from "src/common/services/app.service";
import { CErrorsService } from "src/common/services/errors.service";

@Injectable()
export class CPagesService {
    constructor(
        private appService: CAppService,
        private errorsService: CErrorsService,
        private dataSource: DataSource,
    ) {}

    public async one(slug: string): Promise<IResponse<IPage>> {
        try {
            const page = await this.dataSource.getRepository(CPage).findOne({where: {slug, active: true}, relations: ["translations"]});               

            if (!page) {
                return {statusCode: 404, error: "page not found"};
            }

            page.children = await this.appService.buildChildrenTree("CPage", page, "pos", 1, true, ["translations"]) as CPage[];
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}});   
            const data = this.buildPageExt(page, langs);
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPagesService.one", err);
            return {statusCode: 500, error};
        }
    }

    public async menuMain(): Promise<IResponse<IPage[]>> {
        try {
            const pages = await this.dataSource.getRepository(CPage).find({where: {active: true, menumain: true, parent_id: IsNull()}, order: {pos: 1}, relations: ["translations"]}); 
            
            for (let page of pages) {
                page.children = await this.appService.buildChildrenTree("CPage", page, "pos", 1, true, ["translations"]) as CPage[];
            }
            
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}}); 
            const data = pages.map(p => this.buildPageMin(p, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPagesService.menuMain", err);
            return {statusCode: 500, error};
        }
    } 

    public async menuFoot(): Promise<IResponse<IPage[]>> {
        try {
            const pages = await this.dataSource.getRepository(CPage).find({where: {active: true, menufoot: true, parent_id: IsNull()}, order: {pos: 1}, relations: ["translations"]}); 
            
            for (let page of pages) {
                page.children = await this.appService.buildChildrenTree("CPage", page, "pos", 1, true, ["translations"]) as CPage[];
            }
            
            const langs = await this.dataSource.getRepository(CLang).find({where: {active: true}}); 
            const data = pages.map(p => this.buildPageMin(p, langs));
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPagesService.menuFoot", err);
            return {statusCode: 500, error};
        }
    } 
    
    /////////////////
    // utils
    /////////////////

    private buildPageExt(page: CPage, langs: CLang[]): IPage {
        const data: IPage = {
            id: page.id,
            parent_id: page.parent_id,
            slug: page.slug,
            img: page.img, 
            name: {},
            content: {},
            title: {},
            description: {},
            h1: {},
            children: page.children.map(c => this.buildPageMin(c, langs)), // краткий вариант
        };
        
        for (let l of langs) {
            const t = page.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
            data.content[l.slug] = t.content;
            data.title[l.slug] = t.title;
            data.description[l.slug] = t.description;
            data.h1[l.slug] = t.h1;
        }

        return data;
    }

    private buildPageMin(page: CPage, langs: CLang[]): IPage {
        const data: IPage = {
            id: page.id,
            parent_id: page.parent_id,
            slug: page.slug,
            name: {},
            children: page.children.map(c => this.buildPageMin(c, langs)),
        };
        
        for (let l of langs) {
            const t = page.translations.find(t => t.lang_id === l.id);
            data.name[l.slug] = t.name;
        }

        return data;
    }    
}