import { TGuideStatus } from "src/model/entities/guide";
import { TTaskContentType, TTaskType } from "src/model/entities/task";

export interface IGuideCreate {
    readonly cat_id: number;
    readonly img: string;
    readonly invest: number;
    //readonly twitter_score: number;
    //readonly twitter_username: string;
    readonly bh_score: number;
    readonly status: TGuideStatus;
    readonly hit: boolean;
    readonly active: boolean;
    // relations
    readonly translations: IGuideTranslationCreate[];
    readonly links: IGuideLinkCreate[];
    readonly tasks: ITaskCreate[];
}

export interface IGuideTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
    readonly contentshort: string;
    readonly earnings: string;
}

export interface IGuideLinkCreate {
    readonly linktype_id: number;
    readonly value: string;
    readonly pos: number;
}

export interface ITaskCreate {
    readonly price: number;
    readonly time: number;
    readonly type: TTaskType;
    readonly contenttype: TTaskContentType;
    readonly yt_content: string;
    readonly pos: number;
    readonly actual_until: string;
    // relations
    readonly translations: ITaskTranslationCreate[];
}

export interface ITaskTranslationCreate {
    readonly lang_id: number;
    readonly name: string;
    readonly content: string;
}
