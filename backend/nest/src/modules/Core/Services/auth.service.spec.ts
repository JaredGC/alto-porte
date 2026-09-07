import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@User/Entities/user.entitiy';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const usersRepo = { findOne: jest.fn() };
  const service = new AuthService(usersRepo as unknown as Repository<User>);
  let user: Partial<User>;
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('test-password', 4);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 1,
      name: 'Ana',
      email: 'ana@example.test',
      password: passwordHash,
      access_token: 'test-token',
      role_id: 3,
      role: { id: 3, name: 'Agente', slug: 'agent' },
    };
    usersRepo.findOne.mockImplementation(async () => user);
  });

  it('authenticates with a real bcrypt hash and excludes the password', async () => {
    expect(await service.login('ana@example.test', 'test-password')).toEqual({
      id: 1,
      name: 'Ana',
      email: 'ana@example.test',
      role_id: 3,
      access_token: 'test-token',
    });
    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'ana@example.test' },
      relations: { role: true },
    });
  });

  it('accepts existing PHP bcrypt hashes with the $2y$ prefix', async () => {
    user.password = passwordHash.replace('$2b$', '$2y$');
    await expect(
      service.login('ana@example.test', 'test-password'),
    ).resolves.toHaveProperty('id', 1);
  });

  it('rejects an unknown email', async () => {
    usersRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.login('missing@example.test', 'test-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an incorrect password', async () => {
    await expect(
      service.login('ana@example.test', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a user without an access token', async () => {
    user.access_token = '';
    await expect(
      service.login('ana@example.test', 'test-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a user without a role', async () => {
    user.role = undefined;
    await expect(
      service.login('ana@example.test', 'test-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
