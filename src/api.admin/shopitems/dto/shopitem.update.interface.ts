export interface IShopitemUpdate {
    readonly id: number;
    readonly shopcat_id: number;
    readonly date: string;
    readonly img: string;
    readonly price: number;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IShopitemTranslationUpdate[];
}

export interface IShopitemTranslationUpdate {
    readonly id: number;
    readonly shopitem_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly contentshort: string;
}
