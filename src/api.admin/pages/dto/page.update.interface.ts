export interface IPageUpdate {
    readonly id: number;
    readonly parent_id: number;
    readonly slug: string;
    readonly img: string;
    readonly pos: number;
    readonly active: boolean;
    readonly menumain: boolean;
    readonly menufoot: boolean;
    readonly defended: boolean;   
    readonly translations: IPageTranslationUpdate[];
}

export interface IPageTranslationUpdate {
    readonly id: number;
    readonly page_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly title: string;
    readonly description: string;
    readonly h1: string;
}
