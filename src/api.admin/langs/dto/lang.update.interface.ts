import { TDateFormat, TDir } from "src/model/entities/lang";

export interface ILangUpdate {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly shorttitle: string;
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly slugable: boolean;
    readonly dir: TDir;
    readonly dateformat: TDateFormat;
    readonly locale: string;
    readonly defended: boolean;
}