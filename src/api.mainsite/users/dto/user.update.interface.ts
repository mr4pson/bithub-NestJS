export interface IUserUpdate {
    readonly lang_id: number;
    readonly name: string;
    readonly wallet: string;
    readonly img: string;
    readonly tg_tasks: boolean;
    readonly tg_guides: boolean;
    readonly tg_articles: boolean;
    readonly tg_deadlines: boolean;
    readonly tz: number;
}
