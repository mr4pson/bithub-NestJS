export interface IWordbookUpdate {
    readonly id: number;
    readonly name: string;
    readonly pos: number;
    readonly load_to: string;
    readonly defended: boolean;
    readonly words: IWordUpdate[];    
}

export interface IWordUpdate {
    readonly id: number;
    readonly wordbook_id: number;
    readonly pos: number;
    readonly mark: string;
    readonly note: string;
    readonly defended: boolean;
    readonly translations: IWordTranslationUpdate[];
}

export interface IWordTranslationUpdate {
    readonly id: number;
    readonly lang_id: number;
    readonly word_id: number;
    readonly text: string;
}
