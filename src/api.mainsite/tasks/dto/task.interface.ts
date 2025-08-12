import { IGuide } from "src/api.mainsite/guides/dto/guide.interface";
import { TTaskContentType, TTaskType } from "src/model/entities/task";
import { IMultilangable } from "src/model/multilangable.interface";

export interface ITask {
    id: number;
    guide_id: number;
    price?: number;
    time?: number;
    type?: TTaskType;
    contenttype?: TTaskContentType;
    name?: IMultilangable;
    content?: IMultilangable;
    yt_content?: string;
    actual_until?: Date;
    actual?: boolean;
    created_at?: Date;
    completed?: boolean;
    // relations
    guide?: IGuide;
}
