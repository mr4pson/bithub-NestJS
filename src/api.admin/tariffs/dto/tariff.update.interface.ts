import { TTariffType } from "src/model/entities/tariff";

export interface ITariffUpdate {
    readonly id: number;
    readonly type: TTariffType;
    readonly price: number;
    readonly period: number;
    readonly code: string;
    readonly top: boolean;
    readonly pos: number;
    readonly defended: boolean;
    // relations
    readonly translations: ITariffTranslationUpdate[];
}

export interface ITariffTranslationUpdate {
    readonly id: number;
    readonly tariff_id: number;
    readonly lang_id: number;
    readonly name: string;
    readonly note: string;
}
