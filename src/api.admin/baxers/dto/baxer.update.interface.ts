export interface IBaxerUpdate {
    readonly id: number;
    readonly name: string;
    readonly pos: number;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IBaxerTranslationUpdate[];
}

export interface IBaxerTranslationUpdate {
    readonly id: number;
    readonly baxer_id: number;
    readonly lang_id: number;
    readonly img: string;
    readonly link: string;
}
