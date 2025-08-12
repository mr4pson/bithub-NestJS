export interface IProblemCreate {
    readonly desk_id: number;
    readonly user_id: number;
    readonly guide_id: number;
    readonly task_id: number;
    readonly content: string;    
    readonly actual_until: string;
}
