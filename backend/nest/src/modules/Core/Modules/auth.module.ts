import { Module } from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { AuthController } from '../Controllers/auth.controller';
import { BaseModule } from './base.module';
import { EntitiesModule } from './entities.module';

@Module({
  imports: [EntitiesModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule extends BaseModule {}