import { IMultilangable } from 'src/model/multilangable.interface';

export interface IShopitem {
  readonly id: number;
  readonly date: string;
  readonly img: string;
  readonly price: number;
  readonly discount: number;
  readonly min_items_num?: number;
  readonly available_for?: string;
  readonly name: IMultilangable;
  readonly content?: IMultilangable;
  readonly contentshort?: IMultilangable;
}
