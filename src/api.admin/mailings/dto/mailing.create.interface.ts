export interface IMailingCreate {
    readonly subject: string;
    readonly content: string;
    readonly recipients: string;
}
