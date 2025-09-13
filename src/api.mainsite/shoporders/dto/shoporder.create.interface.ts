export interface IShoporderCreate {
  readonly items: Array<{ shopitem_id: number; qty: number }>;
  readonly tg: string;
  readonly wallet: string;
  readonly comment: string;
  readonly lang_slug: string;
}
