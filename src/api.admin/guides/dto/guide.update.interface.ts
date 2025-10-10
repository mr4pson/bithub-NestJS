import { TGuideStatus } from 'src/model/entities/guide';
import { TTaskContentType, TTaskType } from 'src/model/entities/task';

export interface IGuideUpdate {
  readonly id: number;
  readonly cat_id: number;
  readonly img: string;
  readonly invest: number;
  //readonly twitter_score: number;
  //readonly twitter_username: string;
  readonly bh_score: number;
  readonly status: TGuideStatus;
  readonly hit: boolean;
  readonly active: boolean;
  readonly created_at: string;
  readonly defended: boolean;
  readonly autosave: boolean;
  // relations
  readonly translations: IGuideTranslationUpdate[];
  readonly links: IGuideLinkUpdate[];
  readonly tasks: ITaskUpdate[];
}

export interface IGuideTranslationUpdate {
  readonly id: number;
  readonly guide_id: number;
  readonly lang_id: number;
  readonly name: string;
  readonly content: string;
  readonly contentshort: string;
  readonly earnings: string;
}

export interface IGuideLinkUpdate {
  readonly id: number;
  readonly guide_id: number;
  readonly linktype_id: number;
  readonly value: string;
  readonly pos: number;
  readonly defended: boolean;
}

export interface ITaskUpdate {
  readonly id: number;
  readonly guide_id: number;
  readonly price: number;
  readonly time: number;
  readonly type: TTaskType;
  readonly contenttype: TTaskContentType;
  readonly yt_content: string;
  readonly pos: number;
  readonly actual_until: string;
  readonly created_at: string;
  readonly defended: boolean;
  // relations
  readonly translations: ITaskTranslationUpdate[];
}

export interface ITaskTranslationUpdate {
  readonly id: number;
  readonly task_id: number;
  readonly lang_id: number;
  readonly name: string;
  readonly content: string;
}
