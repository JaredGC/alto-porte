import { BaseModule } from '@Core/Modules/base.module';
import { EntitiesModule } from '@Core/Modules/entities.module';
import { Module } from '@nestjs/common';
import { LeadsService } from '@Deals/Services/leads.service';
import { LeadsController } from '@Deals/Controllers/leads.controller';

@Module({
  imports: [EntitiesModule],
  providers: [LeadsService],
  controllers: [LeadsController],
})
export class LeadsModule extends BaseModule {}