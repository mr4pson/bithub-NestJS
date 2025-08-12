import { TShoporderStatus } from "src/model/entities/shoporder";

export interface IShoporderUpdate {
    readonly id: number;
    readonly shopitem_id: number;
    readonly email: string;
    readonly tg: string;
    readonly comment: string;
    readonly status: TShoporderStatus;
    readonly created_at: string;
    readonly defended: boolean;
}
