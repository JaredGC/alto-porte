import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../Entities/user.entitiy';
import { UserService } from './user.service';

describe('UserService', () => {
  const repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const service = new UserService(repo as unknown as Repository<User>);
  const input = {
    email: 'ana@example.test',
    name: 'Ana',
    password: 'test-password',
    role_id: 3,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    repo.findOne.mockResolvedValue(null);
    repo.save.mockImplementation(async (data) => ({ id: 1, ...data }));
  });

  it('rejects a missing user ID without querying the database', async () => {
    await expect(service.getUser(0)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('reports an unknown user', async () => {
    await expect(service.getUser(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it.each(['email', 'name', 'password'] as const)(
    'rejects registration without %s',
    async (field) => {
      await expect(
        service.register({ ...input, [field]: '' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    },
  );

  it('rejects a duplicate email without saving', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 9, email: input.email });
    await expect(service.register(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('hashes the password, assigns the requested role, and omits the password from the response', async () => {
    const result = await service.register(input);
    const saved = repo.save.mock.calls[0][0];
    expect(saved.password).not.toBe(input.password);
    expect(await bcrypt.compare(input.password, saved.password)).toBe(true);
    expect(result).toEqual({
      id: 1,
      email: input.email,
      name: input.name,
      role_id: 3,
      access_token: expect.any(String),
    });
    expect(result.access_token.length).toBeGreaterThan(0);
  });

  it('rejects an empty bulk registration', async () => {
    await expect(service.registerMany([])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('counts skipped and created users in bulk registration', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      repo.find.mockResolvedValueOnce([{ email: 'exists@example.test' }]);
      repo.save.mockImplementationOnce(async (users) =>
        users.map((user, i) => ({ id: i + 1, ...user })),
      );
      const result = await service.registerMany([
        input,
        { ...input, email: 'exists@example.test' },
        { ...input, email: '' },
      ]);
      expect(result).toEqual({
        total_received: 3,
        created: 1,
        skipped: 2,
        users: [{ id: 1, email: input.email, name: input.name, role_id: 3 }],
      });
    } finally {
      log.mockRestore();
    }
  });
});
