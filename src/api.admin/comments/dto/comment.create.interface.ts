export interface ICommentCreate {
    readonly user_id: number;
    readonly guide_id: number;
    readonly is_admin: boolean;
    readonly content: string;
    readonly active: boolean;
}
