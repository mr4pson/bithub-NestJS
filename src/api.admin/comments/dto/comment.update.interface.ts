export interface ICommentUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly guide_id: number;
    readonly is_admin: boolean;
    readonly content: string;
    readonly active: boolean;
    readonly created_at: string;
    readonly defended: boolean;
}
