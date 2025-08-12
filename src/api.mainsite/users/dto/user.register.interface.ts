export interface IUserRegister {
    readonly lang_id: number;
    readonly name: string;
    readonly email: string;
    readonly code: string;
    readonly password: string;
    readonly wallet: string;
    readonly parent_uuid: string;
    readonly referrer_uuid: string;
    readonly captchaToken: string;
}

