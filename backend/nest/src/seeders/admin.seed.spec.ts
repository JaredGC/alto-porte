import {
  DataSource,
  EntityManager,
  InsertQueryBuilder,
  InsertResult,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@User/Entities/user.entitiy';
import { Role } from '@User/Entities/role.entity';
import { seedAdmin } from './admin.seed';

describe('Admin seeder', () => {
  const users = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const roles = { find: jest.fn(), createQueryBuilder: jest.fn() };
  const insertRole = {
    insert: jest.fn(),
    into: jest.fn(),
    values: jest.fn(),
    execute: jest.fn(),
  };
  const manager = { getRepository: jest.fn(), query: jest.fn() };
  const dataSource = { transaction: jest.fn() };
  const options = {
    name: 'Admin',
    email: 'admin@example.test',
    password: 'test-password',
  };
  const run = () => seedAdmin(dataSource as unknown as DataSource, options);

  beforeEach(() => {
    jest.resetAllMocks();
    users.findOne.mockResolvedValue(null);
    users.create.mockImplementation((data) => data);
    users.save.mockImplementation(async (data) => ({ id: 7, ...data }));
    roles.find.mockResolvedValue([]);
    roles.createQueryBuilder.mockReturnValue(insertRole);
    insertRole.insert.mockReturnThis();
    insertRole.into.mockReturnThis();
    insertRole.values.mockReturnThis();
    manager.getRepository.mockImplementation((entity) => {
      if (entity === User) return users;
      if (entity === Role) return roles;
      throw new Error('Unexpected repository');
    });
    dataSource.transaction.mockImplementation(
      async (work: (manager: EntityManager) => Promise<unknown>) =>
        work(manager as unknown as EntityManager),
    );
  });

  it('creates an admin with a bcrypt password, a token and the required role', async () => {
    expect(await run()).toEqual({ created: true, id: 7, email: options.email });
    expect(insertRole.into).toHaveBeenCalledWith(Role, ['id', 'name', 'slug']);
    expect(insertRole.values).toHaveBeenCalledWith({
      id: 2,
      name: 'Admin',
      slug: 'admin',
    });
    const saved = users.save.mock.calls[0][0];
    expect(await bcrypt.compare(options.password, saved.password)).toBe(true);
    expect(saved.access_token).toMatch(/^[a-f0-9]{64}$/);
    expect(saved).toMatchObject({ role_id: 2, registered: true });
    expect(manager.query).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing admin role', async () => {
    roles.find.mockResolvedValue([{ id: 2, slug: 'admin', name: 'Admin' }]);
    await run();
    expect(insertRole.execute).not.toHaveBeenCalled();
    expect(manager.query).not.toHaveBeenCalled();
  });

  it('preserves an existing admin and its credentials', async () => {
    users.findOne.mockResolvedValue({
      id: 7,
      email: options.email,
      role_id: 2,
    });
    expect(await run()).toEqual({
      created: false,
      id: 7,
      email: options.email,
    });
    expect(users.save).not.toHaveBeenCalled();
    expect(insertRole.execute).not.toHaveBeenCalled();
  });

  it('does not change the role of an existing account', async () => {
    users.findOne.mockResolvedValue({
      id: 7,
      email: options.email,
      role_id: 3,
    });
    await expect(run()).rejects.toThrow('otro rol');
    expect(users.save).not.toHaveBeenCalled();
  });

  it.each([
    { id: 2, slug: 'agent' },
    { id: 9, slug: 'admin' },
  ])('rejects conflicting role IDs or slugs: %j', async (role) => {
    roles.find.mockResolvedValue([role]);
    await expect(run()).rejects.toThrow('ID 2');
    expect(users.save).not.toHaveBeenCalled();
    expect(insertRole.execute).not.toHaveBeenCalled();
  });

  it('rejects an empty password before accessing the database', async () => {
    await expect(
      seedAdmin(dataSource as unknown as DataSource, {
        ...options,
        password: '',
      }),
    ).rejects.toThrow('SEED_ADMIN_PASSWORD');
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('includes the fixed role ID in the actual PostgreSQL INSERT SQL', async () => {
    class MetadataDataSource extends DataSource {
      async prepare() {
        await this.buildMetadatas();
      }
    }
    const metadataSource = new MetadataDataSource({
      type: 'postgres',
      entities: [Role],
    });
    await metadataSource.prepare();
    roles.createQueryBuilder.mockReturnValue(
      metadataSource.getRepository(Role).createQueryBuilder(),
    );
    let capturedSql = '';
    let capturedParameters: unknown[] = [];
    const execute = jest
      .spyOn(InsertQueryBuilder.prototype, 'execute')
      .mockImplementationOnce(async function (this: InsertQueryBuilder<Role>) {
        [capturedSql, capturedParameters] = this.getQueryAndParameters();
        return new InsertResult();
      });
    try {
      await run();
      expect(capturedSql).toMatch(/INSERT INTO "roles"\("id",/);
      expect(capturedParameters[0]).toBe(2);
      expect(users.save.mock.calls[0][0].role_id).toBe(capturedParameters[0]);
    } finally {
      execute.mockRestore();
    }
  });
});
