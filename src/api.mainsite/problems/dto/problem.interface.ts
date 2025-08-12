import { IMultilangable } from "src/model/multilangable.interface";

export interface IProblem {
    readonly id: number;
    readonly desk_id: number;
    readonly user_id: number;
    readonly guide_id: number;
    readonly task_id: number;
    readonly content: string;  
    readonly actual_until: string;
    readonly created_at: Date;  
    // relations
    readonly user?: IProblemUser;
    readonly guide?: IProblemGuide;
    readonly task?: IProblemTask;
}

export interface IProblemUser {
    readonly id: number;
    readonly name: string;
    readonly img: string;
}

export interface IProblemGuide {
    readonly id: number;
    readonly name: IMultilangable;
    readonly img: string;
}

export interface IProblemTask {
    readonly id: number;
    readonly name: IMultilangable;
}