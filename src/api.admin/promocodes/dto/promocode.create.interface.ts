import { TPromocodeLimit } from "src/model/entities/promocode";

export interface IPromocodeCreate {
    readonly code: string;
    readonly discount: number;
    readonly limit: TPromocodeLimit;
    readonly activation_limit: number;
    readonly date_limit: string;
}
