import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { CNetworkService } from "./network.service";
import { JwtService } from "@nestjs/jwt";
import { CSetting } from "src/model/entities/setting";
import { IGoogleResponse } from "src/model/dto/google.response";

@Injectable()
export class CAuthService {
    constructor(
        private dataSource: DataSource,
        private networkService: CNetworkService,
    ) {}

    public compareHash(password, hash): Promise<boolean> {
        return new Promise((resolve, reject) => bcrypt.compare(password, hash, (err, result) => err ? reject(err) : resolve(result)));
    }

    public buildHash(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    public async parseGoogleToken(token: string): Promise<IGoogleResponse> {
        let url = (await this.dataSource.getRepository(CSetting).findOneBy({p: "google-verify-url"}))?.v.replace("{{token}}", token);
        if (!url) throw "no google auth setting";
        const res = await this.networkService.get(url);
        return res.data;
    }    
}
