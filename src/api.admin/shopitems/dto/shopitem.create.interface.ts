export interface IShopitemCreate {
    readonly shopcat_id: number;
    readonly date: string;
    readonly img: string;
    readonly price: number;
    readonly active: boolean;
    readonly translations: IShopitemTranslationCreate[];
}

export interface IShopitemTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly contentshort: string;
}
