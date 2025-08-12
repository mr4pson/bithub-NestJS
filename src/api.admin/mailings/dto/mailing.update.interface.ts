import { TMailingStatus } from "src/model/entities/mailing";

export interface IMailingUpdate {
    readonly id: number;
    readonly subject: string;
    readonly content: string;
    readonly recipients: string;
    readonly status: TMailingStatus;
    readonly running_status: string;
    readonly created_at: string;
    readonly defended: boolean;
}
