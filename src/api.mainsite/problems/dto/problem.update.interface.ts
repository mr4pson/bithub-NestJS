import { IProblemGuide, IProblemTask, IProblemUser } from "./problem.interface";

export interface IProblemUpdate {
    readonly id: number;
    readonly desk_id: number;
    readonly user_id: number;
    readonly guide_id: number;
    readonly task_id: number;
    readonly content: string;    
    readonly actual_until: string;
    readonly created_at: string;
    readonly user: IProblemUser;
    readonly guide: IProblemGuide;
    readonly task: IProblemTask; 
}
