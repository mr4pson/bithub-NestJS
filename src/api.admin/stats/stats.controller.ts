import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CStatsService } from './stats.service';
import { IResponse } from 'src/model/dto/response.interface';
import { IStatUsersMonthly } from './dto/stat.users.monthly.interface';
import { IStatCats } from './dto/stat.cats.interface';
import { IStatTotals } from './dto/stat.totals.interface';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';

@Controller('api/admin/stats')
export class CStatsController {
  constructor(private statsService: CStatsService) {}

  // @UseGuards(CAdminGuard)
  @Post('users-monthly')
  public usersMonthly(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatUsersMonthly>> {
    return this.statsService.usersMonthly(body);
  }

  @UseGuards(CAdminGuard)
  @Post('cats')
  public cats(): Promise<IResponse<IStatCats>> {
    return this.statsService.cats();
  }

  @UseGuards(CAdminGuard)
  @Post('inorders-monthly/:year')
  public inordersMonthly(
    @Param('year') year: string,
  ): Promise<IResponse<number[]>> {
    return this.statsService.inordersMonthly(parseInt(year));
  }

  @UseGuards(CAdminGuard)
  @Post('totals')
  public totals(): Promise<IResponse<IStatTotals>> {
    return this.statsService.totals();
  }

  // @UseGuards(CAdminGuard)
  @Post('mau')
  public mauByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.mauByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('subscribers')
  public subscribersByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.subscribersByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('avg-subscription-price')
  public outordersAvgAmountByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.outordersAvgAmountByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('subscription-profit')
  public outordersProfitByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.outordersProfitByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('clients')
  public shopordersBuyersByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.shopordersBuyersByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('avg-client-order-price')
  public shopordersAvgOrderPriceByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.shopordersAvgOrderPriceByMonths(body);
  }

  // @UseGuards(CAdminGuard)
  @Post('shoporders-revenue')
  public shopordersRevenueByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.shopordersRevenueByMonths(body);
  }
  // @UseGuards(CAdminGuard)
  @Post('shoporders-profit')
  public shopordersProfitByMonths(
    @Body() body: { from: string; to: string },
  ): Promise<IResponse<IStatTotals>> {
    return this.statsService.shopordersProfitByMonths(body);
  }
}
