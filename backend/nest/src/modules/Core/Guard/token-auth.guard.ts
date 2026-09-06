import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesMap } from './roles-map';
import { ROLE_KEY } from './token-guard.decorator';
import { User } from '@User/Entities/user.entitiy';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requestedRoles = this.reflector.get<string[]>(ROLE_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Falta el header Authorization');

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException('Token inválido');

    const user = await this.userRepo.findOne({
      where: { access_token: token },
    });

    if (!user) throw new UnauthorizedException('Token no válido o expirado');

    request.user = user;

    if (!requestedRoles?.length) return true;

    const requestedRolesIds = requestedRoles.map((r) => RolesMap[r]);

    const hasRole = requestedRolesIds.includes(user.role_id);

    if (!hasRole) throw new ForbiddenException(`No tienes permiso (${requestedRolesIds})`);

    return true;
  }
}
