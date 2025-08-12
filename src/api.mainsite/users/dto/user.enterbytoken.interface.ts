export interface IUserEnterByToken {
    readonly type: "Google" | "Apple";
    readonly lang_id: number;
    readonly token: string;
}
