import { IImagable } from "src/model/imagable.interface";
import { IKeyValue } from "src/model/keyvalue.interface";
import { CUploadsService } from "./uploads.service";
import { DataSource } from "typeorm";

export abstract class CImagableService {
    protected abstract entity: string;
    protected abstract folder: string;
    protected abstract resizeMap: IKeyValue<number>; // {img: 1000, img_s: 300, ...}

    constructor(
        protected uploadsService: CUploadsService,
        protected dataSource: DataSource,
    ) {}

    protected async buildImg(x: IImagable, uploads: Express.Multer.File[]): Promise<void> {
        // if img set to null, then clear all additional fields
        if (!x.img) {
            this.resetImg(x);
            return;
        }        
        
        // process upload
        const upload = uploads.find(u => u.fieldname === "img");
        if (!upload) return;
        const resizeValues = Object.values(this.resizeMap);
        const paths = await this.uploadsService.imgUploadResize(upload, this.folder, resizeValues);
        let i = 0;

        for (let field in this.resizeMap) {
            x[field] = paths[i++];
        }        
    }  
    
    protected resetImg(x: IImagable): void {
        for (let field in this.resizeMap) {
            x[field] = null;
        }
    }    

    protected async deleteUnbindedImgOnDelete(xl: IImagable[], withChildren: boolean): Promise<void> {        
        for (let x of xl) {
            for (let field in this.resizeMap) {
                if (x[field] && !x[field].includes("test")) {
                    await this.uploadsService.fileDelete(`images/${this.folder}/${x[field]}`);
                }
            } 
    
            if (withChildren) {
                const children = await this.dataSource.getRepository(this.entity).find({where: {parent_id: x.id}}) as IImagable[];
                await this.deleteUnbindedImgOnDelete(children, true);                
            }  
        }
    }

    protected async deleteUnbindedImgOnUpdate(current: IImagable, old: IImagable): Promise<void> {
        if ((current as IImagable).img !== old.img && old.img) { // got new img data
            for (let field in this.resizeMap) {
                if (!old[field].includes("test")) {
                    this.uploadsService.fileDelete(`images/${this.folder}/${old[field]}`);
                }                
            }                
        }
    }
}
