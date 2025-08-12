import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { CStatsService } from "./stats.service";
import { IResponse } from "src/model/dto/response.interface";
import { IStatUsersMonthly } from "./dto/stat.users.monthly.interface";
import { IStatCats } from "./dto/stat.cats.interface";
import { IStatTotals } from "./dto/stat.totals.interface";
import { CAdminGuard } from "src/common/services/guards/admin.guard";

@Controller('api/admin/stats')
export class CStatsController {
    constructor (private statsService: CStatsService) {}

    @UseGuards(CAdminGuard)
    @Post("users-monthly/:year")
    public usersMonthly(@Param("year") year: string): Promise<IResponse<IStatUsersMonthly>> {
        return this.statsService.usersMonthly(parseInt(year));
    }

    @UseGuards(CAdminGuard)
    @Post("cats")
    public cats(): Promise<IResponse<IStatCats>> {
        return this.statsService.cats();
    }

    @UseGuards(CAdminGuard)
    @Post("inorders-monthly/:year")
    public inordersMonthly(@Param("year") year: string): Promise<IResponse<number[]>> {
        return this.statsService.inordersMonthly(parseInt(year));
    }

    @UseGuards(CAdminGuard)
    @Post("totals")
    public totals(): Promise<IResponse<IStatTotals>> {
        return this.statsService.totals();
    }
}