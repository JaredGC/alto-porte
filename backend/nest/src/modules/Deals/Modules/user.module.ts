import { BaseModule } from '@Core/Modules/base.module';
import { EntitiesModule } from '@Core/Modules/entities.module';
import { Module } from '@nestjs/common';
import { UserService } from '@User/Services/user.service';
import { UserController } from '@User/Controllers/user.controller';

@Module({
  imports: [EntitiesModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule extends BaseModule {}