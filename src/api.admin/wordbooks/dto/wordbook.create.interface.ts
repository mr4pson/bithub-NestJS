export interface IWordbookCreate {    
    readonly name: string;
    readonly pos: number;
    readonly load_to: string;
    readonly words: IWordCreate[];    
}

export interface IWordCreate {
    readonly pos: number;
    readonly mark: string;
    readonly note: string;
    readonly translations: IWordTranslationCreate[];
}

export interface IWordTranslationCreate {
    readonly lang_id: number;
    readonly text: string;
}
