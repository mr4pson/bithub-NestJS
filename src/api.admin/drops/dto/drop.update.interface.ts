export interface IDropUpdate {
    readonly id: number;
    readonly defended: boolean;

    readonly name: string;
    readonly img: string;
    readonly drop: string;
    readonly early: boolean;
    readonly score: number;
    readonly spending_money: number;
    readonly spending_time: number;
    readonly term: number;
    readonly fundrising: string;
    readonly invest: number;
    readonly cat: string;
    readonly date: string;

    readonly translations: IDropTranslationUpdate[];
}

export interface IDropTranslationUpdate {
    readonly id: number;
    readonly drop_id: number;
    readonly lang_id: number;
    readonly tasks: string;
}
