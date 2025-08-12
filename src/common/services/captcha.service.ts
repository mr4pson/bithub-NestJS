import { Injectable } from "@nestjs/common";
import { CSetting } from "src/model/entities/setting";
import { DataSource } from "typeorm";
import { CNetworkService } from "src/common/services/network.service";

export interface ICaptchaResponse {
    readonly success: boolean;
    readonly challenge_ts: string;
    readonly hostname: string;
    readonly "error-codes": string[];
}

@Injectable()
export class CCaptchaService {
    constructor(
        private dataSource: DataSource,
        private networkService: CNetworkService,
    ) {} 

    public async verify(token: string): Promise<boolean> {
        const key = (await this.dataSource.getRepository(CSetting).findOneBy({p: `hcaptcha-private`}))?.v;
        const url = (await this.dataSource.getRepository(CSetting).findOneBy({p: `hcaptcha-back-url`}))?.v;

        if (!key || !url) {
            throw "captcha setting not found";
        }

        const fd = new FormData();
        fd.append("secret", key);
        fd.append("response", token);            
        const res = await this.networkService.post(url, fd);
        const data = res.data as ICaptchaResponse;
        return data.success;        
    }
}