import { TShoporderStatus } from 'src/model/entities/shoporder';

export interface IShoporderUpdate {
  readonly id: number;
  readonly items: Array<{ shopitem_id: number; qty: number }>;
  readonly email: string;
  readonly tg: string;
  readonly comment: string;
  readonly status: TShoporderStatus;
  readonly created_at: string;
  readonly defended: boolean;
}
