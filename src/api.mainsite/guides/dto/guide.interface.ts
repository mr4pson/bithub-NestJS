import { IMultilangable } from 'src/model/multilangable.interface';
import { IGuideLink } from './guide.link.interface';
import { ITask } from 'src/api.mainsite/tasks/dto/task.interface';
import {
  GuideTypes,
  TGuideEarnings,
  TGuideStatus,
} from 'src/model/entities/guide';

export interface IGuide {
  id: number;
  img?: string;
  invest?: number;
  bh_score?: number;
  slug?: string;
  name: IMultilangable;
  content?: IMultilangable;
  contentshort?: IMultilangable;
  earnings?: TGuideEarnings;
  price?: number;
  time?: number;
  created_at?: Date;
  status?: TGuideStatus;
  hit?: boolean;
  favorited?: boolean;
  progress?: number;
  type?: GuideTypes;
  steps_limit?: number;
  note?: string;
  has_unviewed?: boolean;
  // relations
  links?: IGuideLink[];
  tasks?: ITask[];
  // whether tasks are blocked due to viewedGuides limit
  isTasksBlocked?: boolean;
  isJustViewed?: boolean;
  isTestPeriodEnded?: boolean;
  guidesViewedCount?: number;
}
