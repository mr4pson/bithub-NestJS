export interface IAwardCreate {
    readonly img: string;
    readonly investments: number;
    readonly earnings: number;
    readonly date: string;
    readonly active: boolean;
    readonly translations: IAwardTranslationCreate[];
}

export interface IAwardTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
