export interface IArtcatUpdate {
    readonly id: number;
    readonly pos: number;
    readonly defended: boolean;   
    readonly translations: IArtcatTranslationUpdate[];
}

export interface IArtcatTranslationUpdate {
    readonly id: number;
    readonly artcat_id: number;
    readonly lang_id: number;
    readonly name: string;
}
