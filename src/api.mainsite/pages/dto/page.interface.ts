import { IKeyValue } from "src/model/keyvalue.interface";
import { IMultilangable } from "src/model/multilangable.interface";

export interface IPage {
    id: number;
    parent_id: number;
    slug: string;
    img?: string;
    name: IMultilangable;
    content?: IMultilangable;
    title?: IMultilangable;
    description?: IMultilangable;
    h1?: IMultilangable;
    children: IPage[];
    words?: IPageWords;
}

export type IPageWords = IKeyValue<IMultilangable>;
