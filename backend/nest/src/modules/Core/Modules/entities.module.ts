import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from '@Dashboard/Entities/dashboard.entitiy';
import { User } from '@User/Entities/user.entitiy';
import { Role } from '@User/Entities/role.entity';
import { Lead } from '@Deals/Entities/lead.entitiy';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dashboard,
      User,
      Role,
      Lead
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
