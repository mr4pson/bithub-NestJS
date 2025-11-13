import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { CAdminGuard } from 'src/common/services/guards/admin.guard';
import { StatisticsService } from './statistics.service';

@Controller('api/admin/statistics')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  // @UseGuards(CAdminGuard)
  @Post('full')
  public async full(@Body() body: { year?: number }): Promise<any> {
    const year = body?.year;
    const [traffic, users, orders] = await Promise.all([
      this.statisticsService.traffic(year),
      this.statisticsService.usersCount(year),
      this.statisticsService.orders(year),
    ]);
    return { traffic, users, orders };
  }
}
