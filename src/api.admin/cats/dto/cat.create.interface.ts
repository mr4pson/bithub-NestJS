export interface ICatCreate {
    readonly paid: boolean;
    readonly pos: number;
    readonly translations: ICatTranslationCreate[];
}

export interface ICatTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
