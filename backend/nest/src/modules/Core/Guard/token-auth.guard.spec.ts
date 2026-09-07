import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { User } from '@User/Entities/user.entitiy';
import { TokenAuthGuard } from './token-auth.guard';

describe('TokenAuthGuard', () => {
  const userRepo = { findOne: jest.fn() };
  const reflector = { get: jest.fn() };
  const guard = new TokenAuthGuard(
    userRepo as unknown as Repository<User>,
    reflector as unknown as Reflector,
  );
  let request: { headers: { authorization?: string }; user?: Partial<User> };
  let context: ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    reflector.get.mockReturnValue(undefined);
    userRepo.findOne.mockResolvedValue({ id: 1, role_id: 3 });
    request = { headers: { authorization: 'Bearer test-token' } };
    context = {
      getHandler: () => () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  });

  it.each([undefined, '', 'Basic test-token', 'Bearer', 'Bearer '])(
    'rejects a missing or malformed Authorization header: %s',
    async (header) => {
      request.headers.authorization = header;
      await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(userRepo.findOne).not.toHaveBeenCalled();
    },
  );

  it('rejects an unknown token', async () => {
    userRepo.findOne.mockResolvedValueOnce(null);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the authenticated user to the request', async () => {
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 1, role_id: 3 });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { access_token: 'test-token' },
    });
  });

  it('allows one of the requested roles', async () => {
    reflector.get.mockReturnValue(['admin', 'agent']);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects an agent from a super-admin action', async () => {
    reflector.get.mockReturnValue(['super_admin']);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
