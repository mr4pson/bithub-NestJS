export interface IDropCreate {
    readonly name: string;
    readonly img: string;
    readonly drop: string;
    readonly early: boolean;
    readonly score: number;
    readonly spending_money: number;
    readonly spending_time: number;
    readonly term: number;
    readonly fundrising: string;
    readonly cat: string;
    readonly date: string;

    readonly translations: IDropTranslationCreate[];
}

export interface IDropTranslationCreate {
    readonly lang_id: number;
    readonly tasks: string;
    readonly invest: string;
    readonly link: string;
}
