import { Injectable } from "@nestjs/common";
import { CAppService } from "./app.service";
import * as sharp from 'sharp';

export interface IResizeResult {
    buffer: Buffer;
    fileName: string;
    contentType: string;
}

@Injectable()
export class CResizeService {
    constructor(private appService: CAppService) {}

    public async resize(data: string | Express.Multer.File, width: number): Promise<IResizeResult> {        
        const extension = typeof(data) === "string" ? this.appService.getFileExtensionByData(data) : this.appService.getFileExtensionByName(data.originalname);
        const fileName = Math.round(new Date().getTime()).toString()+`_${width}.${extension}`;    
        const inBuffer = typeof(data) === "string" ? Buffer.from(data.split(",")[1], 'base64') : data.buffer; 
        const contentType = typeof(data) === "string" ? this.appService.getContentType(data) : data.mimetype;
        
        // rotate() - поворачиваем в соответствии с метаданными, которые по умолчанию не используются (и не надо, т.к. не все устройства их понимают!)  
        // jpeg() - применить параметры формата jpeg, аналогично можно использовать png(), gif() и др. функции с параметрами, доступными для этих форматов  
        // в этой версии решено не конвертировать все подряд в jpeg, но пережимать размеры все равно надо
        let outBuffer: Buffer = null;

        if (contentType === "image/jpeg") {
            outBuffer = await sharp(inBuffer).rotate().resize({width, withoutEnlargement: true}).jpeg({quality: 70}).toBuffer();
        } else if (contentType === "image/webp") {
            outBuffer = await sharp(inBuffer).rotate().resize({width, withoutEnlargement: true}).webp({quality: 70}).toBuffer();
        } else if (contentType === "image/gif") {
            outBuffer = await sharp(inBuffer, {animated: true}).rotate().resize({width, withoutEnlargement: true}).toBuffer();
        } else if (contentType === "image/svg+xml") {
            outBuffer = inBuffer; // just save
        } else {
            outBuffer = await sharp(inBuffer).rotate().resize({width, withoutEnlargement: true}).toBuffer();
        }
        
        return {buffer: outBuffer, fileName, contentType};
    } 
}