import { IMultilangable } from "src/model/multilangable.interface";

export interface ISubscriptionTariff {
    readonly id: number;
    readonly price: number;
    readonly period: number;
    readonly top: boolean;
    readonly name: IMultilangable;
    readonly note: IMultilangable;
}