import { BaseModule } from '@Core/Modules/base.module';
import { EntitiesModule } from '@Core/Modules/entities.module';
import { Module } from '@nestjs/common';
import { DashboardService } from '@Dashboard/Services/dashboard.service';
import { DashboardController } from '@Dashboard/Controllers/dashboard.controller';

@Module({
  imports: [EntitiesModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule extends BaseModule {}