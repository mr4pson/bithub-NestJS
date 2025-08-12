export interface IAwardUpdate {
    readonly id: number;
    readonly img: string;
    readonly investments: number;
    readonly earnings: number;
    readonly date: string;
    readonly active: boolean;
    readonly defended: boolean;
    readonly translations: IAwardTranslationUpdate[];
}

export interface IAwardTranslationUpdate {
    readonly id: number;
    readonly award_id: number;
    readonly lang_id: number;
    readonly name: string;
}
