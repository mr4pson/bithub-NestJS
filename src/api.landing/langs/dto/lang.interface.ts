import { TDateFormat, TDir } from "src/model/entities/lang";

export interface ILang {
    readonly id: number;     
    readonly slug: string;    
    readonly title: string;
    readonly shorttitle: string;
    readonly dir: TDir; 
    readonly dateformat: TDateFormat;
}
