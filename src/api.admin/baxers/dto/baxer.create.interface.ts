export interface IBaxerCreate {
    readonly name: string;
    readonly pos: number;
    readonly active: boolean;
    readonly translations: IBaxerTranslationCreate[];
}

export interface IBaxerTranslationCreate {
    readonly lang_id: number;
    readonly img: string;
    readonly link: string;
}