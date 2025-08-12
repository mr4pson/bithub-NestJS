import { TPromocodeLimit } from "src/model/entities/promocode";

export interface IPromocodeUpdate {
    readonly id: number;
    readonly code: string;
    readonly discount: number;
    readonly limit: TPromocodeLimit;
    readonly activation_limit: number;
    readonly date_limit: string;
    readonly created_at: string;
    readonly defended: boolean;
}
