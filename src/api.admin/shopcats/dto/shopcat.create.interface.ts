export interface IShopcatCreate {
    readonly paid: boolean;
    readonly pos: number;
    readonly translations: IShopcatTranslationCreate[];
}

export interface IShopcatTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
