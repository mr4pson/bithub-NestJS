import { IMultilangable } from 'src/model/multilangable.interface';

export interface IArticle {
  readonly id: number;
  readonly slug: string;
  readonly date: string;
  readonly img: string;
  readonly yt_content?: string;
  readonly readtime: number;
  readonly is_for_landing?: boolean;
  readonly name: IMultilangable;
  readonly content?: IMultilangable;
  readonly contentshort?: IMultilangable;
  readonly title?: IMultilangable;
  readonly description?: IMultilangable;
  readonly canonical?: IMultilangable;
  readonly h1?: IMultilangable;
  readonly was_read?: boolean;
}
