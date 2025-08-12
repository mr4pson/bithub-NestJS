import { TProposalStatus } from "src/model/entities/proposal";

export interface IProposalUpdate {
    readonly id: number;
    readonly user_id: number;
    readonly content: string;
    readonly status: TProposalStatus;
    readonly created_at: string;
    readonly defended: boolean;
}
