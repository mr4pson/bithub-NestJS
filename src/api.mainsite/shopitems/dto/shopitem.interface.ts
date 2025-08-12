import { IMultilangable } from "src/model/multilangable.interface";

export interface IShopitem {
    readonly id: number;
    readonly date: string;
    readonly img: string;
    readonly price: number;
    readonly name: IMultilangable;
    readonly content?: IMultilangable;
    readonly contentshort?: IMultilangable;
}