export interface IFileUpdate {
    readonly id: number;
    readonly mark: string;
    readonly filename: string;
    readonly fileurl: string;
    readonly filetype: string;
    readonly load_to: string;
    readonly defended: boolean;   
}