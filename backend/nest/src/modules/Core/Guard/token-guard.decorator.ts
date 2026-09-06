import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { TokenAuthGuard } from './token-auth.guard';

export const ROLE_KEY = 'roles_required';

export const TokenGuard = (roles?: string | string[]) => {
  const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];
  return applyDecorators(SetMetadata(ROLE_KEY, roleList), UseGuards(TokenAuthGuard));
};