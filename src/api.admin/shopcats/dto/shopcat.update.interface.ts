export interface IShopcatUpdate {
    readonly id: number;
    readonly paid: boolean;
    readonly pos: number;
    readonly defended: boolean;
    readonly translations: IShopcatTranslationUpdate[];
}

export interface IShopcatTranslationUpdate {
    readonly id: number;
    readonly shopcat_id: number;
    readonly lang_id: number;
    readonly name: string;
}
