export interface ICatUpdate {
    readonly id: number;
    readonly paid: boolean;
    readonly pos: number;
    readonly defended: boolean;
    readonly translations: ICatTranslationUpdate[];
}

export interface ICatTranslationUpdate {
    readonly id: number;
    readonly cat_id: number;
    readonly lang_id: number;
    readonly name: string;
}
