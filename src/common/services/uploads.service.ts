import { Injectable } from '@nestjs/common';
import * as FS from "fs";
import { CAppService } from './app.service';
import { CResizeService } from './resize.service';

@Injectable()
export class CUploadsService {    
    constructor(
        private appService: CAppService,
        private resizeService: CResizeService,
    ) {}

    public async imgUploadResize(data: string | Express.Multer.File, folder: string, widths: number[]): Promise<string[]> {                
        const diskFolder = `../static/images/${folder}`;
        const diskSubfolder = this.buildSubfolder();
        const diskFullFolder = `${diskFolder}/${diskSubfolder}`;            
        !FS.existsSync(diskFullFolder) && FS.mkdirSync(diskFullFolder, {recursive: true});        
        const paths: string[] = [];                        
                
        for (let w of widths) {
            const res = await this.resizeService.resize(data, w);
            await this.writeFile(`${diskFullFolder}/${res.fileName}`, res.buffer);
            paths.push(`${diskSubfolder}/${res.fileName}`);
        }    
                                         
        return paths;      
    }
    
    /*
    public async imgUpload(data: string, folder: string): Promise<string> {                
        const diskFolder: string = `../static/images/${folder}`;
        const diskSubfolder = this.buildSubfolder();
        const diskFullFolder: string = `${diskFolder}/${diskSubfolder}`;            
        !FS.existsSync(diskFullFolder) && FS.mkdirSync(diskFullFolder, {recursive: true});                    
        const filename = await this.saveFileFromString(diskFullFolder, data);
        const path = `${diskSubfolder}/${filename}`;
        return path;         
    }
    */

    public fileDelete(path: string): Promise<void> {
        return new Promise((resolve, reject) => 
            FS.existsSync(`../static/${path}`) ? 
                FS.rm(`../static/${path}`, err => err ? reject(err) : resolve()) :
                resolve());        
    }

    public async fileUpload(data: string | Express.Multer.File, folder: string): Promise<string> {                
        const diskFolder: string = `../static/${folder}`;
        const diskSubfolder = this.buildSubfolder();
        const diskFullFolder: string = `${diskFolder}/${diskSubfolder}`;            
        !FS.existsSync(diskFullFolder) && FS.mkdirSync(diskFullFolder, {recursive: true});                    
        const filename = typeof(data) === "string" ? 
            await this.saveFileFromString(diskFullFolder, data) : 
            await this.saveFileFromBuffer(diskFullFolder, data);
        const path = `${diskSubfolder}/${filename}`;
        return path;         
    }

    /////////////////
    // utils    
    /////////////////
    
    private async saveFileFromString(folder: string, data: string): Promise<string> {
        const extension = this.appService.getFileExtensionByData(data);
        const fileName = Math.round(new Date().getTime()).toString() + "." + extension;            
        const buffer = Buffer.from(data.split(",")[1], 'base64');
        await this.writeFile(`${folder}/${fileName}`, buffer);
        return fileName;
    }

    private async saveFileFromBuffer(folder: string, data: Express.Multer.File): Promise<string> {        
        const extension = this.appService.getFileExtensionByName(data.originalname);
        const fileName = Math.round(new Date().getTime()).toString() + "." + extension;     
        await this.writeFile(`${folder}/${fileName}`, data.buffer);
        return fileName;
    }

    private writeFile(path: string, buffer: Buffer): Promise<void> {
        return new Promise((resolve, reject) => FS.writeFile(path, buffer, err => err ? reject(err) : resolve()));
    }

    private buildSubfolder(): string {
        const date = new Date();
        const time = date.getTime().toString();
        return `${date.getFullYear ()}-${date.getMonth() + 1}/${time.slice(time.length - 4, time.length - 2)}/${time.slice(time.length - 2, time.length)}`;
    }
}
