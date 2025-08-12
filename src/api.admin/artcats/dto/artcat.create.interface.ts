export interface IArtcatCreate {
    readonly pos: number;
    readonly translations: IArtcatTranslationCreate[];
}

export interface IArtcatTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
}
