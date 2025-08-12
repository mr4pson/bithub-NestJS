export interface ICommentCreate {
    readonly guide_id: number;
    readonly content: string;
    readonly captchaToken: string;
}