export interface IArticleCreate {
    readonly artcat_id: number;
    readonly slug: string;
    readonly date: string;
    readonly img: string;
    readonly yt_content: string;
    readonly readtime: number
    readonly active: boolean;
    readonly translations: IArticleTranslationCreate[];
}

export interface IArticleTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly contentshort: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
    readonly keywords: string;
}
