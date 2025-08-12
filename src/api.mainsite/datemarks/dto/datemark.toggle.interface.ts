import { TDatemarkType } from "src/model/entities/datemark";

export interface IDatemarkToggle {
    readonly guide_id: number;
    readonly type: TDatemarkType;
    readonly date: string;
}
