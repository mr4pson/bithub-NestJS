import { IMultilangable } from "src/model/multilangable.interface";

export interface IBaxer {
    readonly id: number;
    readonly img: IMultilangable;
    readonly link: IMultilangable;
}
