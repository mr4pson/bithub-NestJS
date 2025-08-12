export interface IMailtemplateCreate {
    readonly name: string;
    readonly translations: IMailtemplateTranslationCreate[];
}

export interface IMailtemplateTranslationCreate {
    readonly lang_id: number;
    readonly subject: string;
    readonly content: string;    
}