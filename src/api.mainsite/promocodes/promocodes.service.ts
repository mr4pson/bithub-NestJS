import { Injectable } from "@nestjs/common";
import { CErrorsService } from "src/common/services/errors.service";
import { IResponse } from "src/model/dto/response.interface";
import { CPromocode } from "src/model/entities/promocode";
import { DataSource } from "typeorm";
import { IPromocode } from "./dto/promocode.interface";

@Injectable()
export class CPromocodesService {
    constructor(
        private errorsService: CErrorsService,
        private dataSource: DataSource,
    ) {}

    public async one(code: string): Promise<IResponse<IPromocode>> {
        try {
            const promocode = await this.dataSource.getRepository(CPromocode).findOneBy({code});
            if (!this.check(promocode)) return {statusCode: 409, error: "code is invalid"};
            const data: IPromocode = {code, discount: promocode.discount};
            return {statusCode: 200, data};
        } catch (err) {
            const error = await this.errorsService.log("api.mainsite/CPromocodesService.discount", err);
            return {statusCode: 500, error};
        }
    }

    ///////////////
    // utils
    ///////////////

    public check(promocode: CPromocode): boolean {
        if (!promocode) {
            return false;
        }
        
        if (promocode.limit === "activation" && !promocode.activation_limit) {
            return false;
        }

        if (promocode.limit === "date" && (!promocode.date_limit || promocode.date_limit.getTime() < new Date().getTime())) {            
            return false;
        }

        return true;
    }
}