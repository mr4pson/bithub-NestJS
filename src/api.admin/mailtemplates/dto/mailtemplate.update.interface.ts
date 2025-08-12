export interface IMailtemplateUpdate {
    readonly id: number;
    readonly name: string;
    readonly defended: boolean;   
    readonly translations: IMailtemplateTranslationUpdate[];
}

export interface IMailtemplateTranslationUpdate {
    readonly id: number;
    readonly mailtemplate_id: number;
    readonly lang_id: number;
    readonly subject: string;
    readonly content: string;    
}