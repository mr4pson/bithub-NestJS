import { TDatemarkType } from "src/model/entities/datemark";

export interface IDatemarkGetList {
    readonly guide_id: number;
    readonly type: TDatemarkType;
    readonly month: number;
    readonly year: number;
}
