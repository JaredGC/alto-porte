import { Module } from '@nestjs/common';
import { TokenAuthGuard } from '@Core/Guard/token-auth.guard';
import { EntitiesModule } from './entities.module';

@Module({
  imports: [EntitiesModule],
  providers: [TokenAuthGuard],
})
export class BaseModule {}