export interface IProblemComment {
    readonly id: number;
    readonly problem_id: number;
    readonly user_id: number;
    readonly user_name: string;
    readonly user_img: string;
    readonly content: string;
    readonly created_at: Date;
}