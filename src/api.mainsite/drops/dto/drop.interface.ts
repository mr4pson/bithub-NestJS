import { IMultilangable } from "src/model/multilangable.interface";

export interface IDrop {
    id: number;
    name: string;
    link: IMultilangable;
    img: string;
    drop: string;
    early: boolean;
    score: number;
    spending_money: number;
    spending_time: number;
    tasks: IMultilangable;
    term: number;
    fundrising: string;
    invest: IMultilangable;
    cat: string;
    date: IMultilangable;
}
