import { TTariffType } from "src/model/entities/tariff";

export interface ITariffCreate {
    readonly type: TTariffType;
    readonly price: number;
    readonly period: number;
    readonly code: string;
    readonly top: boolean;
    readonly pos: number;
    // relations
    readonly translations: ITariffTranslationCreate[];
}

export interface ITariffTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly note: string;
}
