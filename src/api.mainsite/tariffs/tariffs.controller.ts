import { Controller, Param, Post } from "@nestjs/common";
import { CTariffsService } from "./tariffs.service";
import { IResponse } from "src/model/dto/response.interface";
import { ISubscriptionTariff } from "./dto/subscription.tariff.interface";
import { IOnetimeTariff } from "./dto/onetime.tariff.interface";

@Controller('api/mainsite/tariffs')
export class CTariffsController {
    constructor (private tariffsService: CTariffsService) {}    
    
    @Post("subscription-all")
    public subscriptionAll(): Promise<IResponse<ISubscriptionTariff[]>> {
        return this.tariffsService.subscriptionAll();
    }  
    
    @Post("onetime-one/:code")
    public onetimeOne(@Param("code") code: string): Promise<IResponse<IOnetimeTariff>> {
        return this.tariffsService.onetimeOne(code);
    }
}
