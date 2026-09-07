import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { User } from '@User/Entities/user.entitiy';
import { Role } from '@User/Entities/role.entity';
import { Lead } from '@Deals/Entities/lead.entitiy';
import { Dashboard } from '@Dashboard/Entities/dashboard.entitiy';

// Keep the actual application modules, controllers, services, and guards.
// Replace only database startup and repository I/O; no PostgreSQL connection is opened.
jest.mock('@nestjs/typeorm', () => {
  const actual = jest.requireActual('@nestjs/typeorm');
  class TestDatabaseModule {}
  actual.TypeOrmModule.forRoot = () => ({ module: TestDatabaseModule });
  return actual;
});

describe('API HTTP integration (mocked repositories)', () => {
  let app: INestApplication<App>;
  const userRepo = { findOne: jest.fn() };
  const leadRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const dashboardRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  let passwordHash: string;
  let cache: { id: number; json: unknown; syncronized: boolean } | null;
  const leadInput = {
    name: 'Ana',
    email: 'ana@example.test',
    phone: '5550000',
    source: 'Facebook',
    project: 'Altavista',
    budget: 150000,
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('test-password', 4);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(Role))
      .useValue({})
      .overrideProvider(getRepositoryToken(Lead))
      .useValue(leadRepo)
      .overrideProvider(getRepositoryToken(Dashboard))
      .useValue(dashboardRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    cache = null;
    userRepo.findOne.mockImplementation(async ({ where }) => {
      if (
        where.email === 'ana@example.test' ||
        where.access_token === 'agent-token'
      ) {
        return {
          id: 3,
          name: 'Ana',
          email: 'ana@example.test',
          password: passwordHash,
          access_token: 'agent-token',
          role_id: 3,
          role: { id: 3, slug: 'agent' },
        };
      }
      if (where.access_token === 'admin-token') return { id: 1, role_id: 1 };
      return null;
    });
    leadRepo.find.mockResolvedValue([]);
    leadRepo.findOne.mockResolvedValue(null);
    leadRepo.create.mockImplementation((data) => data);
    leadRepo.save.mockImplementation(async (data) => ({ id: 7, ...data }));
    leadRepo.update.mockResolvedValue({ affected: 1 });
    leadRepo.delete.mockResolvedValue({ affected: 1 });
    dashboardRepo.findOne.mockImplementation(async () =>
      cache?.syncronized ? cache : null,
    );
    dashboardRepo.create.mockImplementation((data) => ({ id: 1, ...data }));
    dashboardRepo.save.mockImplementation(async (data) => {
      cache = data;
      return data;
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves the root under /api and not /', async () => {
    await request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('Hello World!');
    await request(app.getHttpServer()).get('/').expect(404);
  });

  it('logs in and returns the public user fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ana@example.test', password: 'test-password' })
      .expect(201);
    expect(response.body).toEqual({
      id: 3,
      name: 'Ana',
      email: 'ana@example.test',
      role_id: 3,
      access_token: 'agent-token',
    });
  });

  it('returns 401 for incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ana@example.test', password: 'wrong' })
      .expect(401);
  });

  it('returns the dashboard contract and reuses its cache', async () => {
    leadRepo.find.mockResolvedValue([
      { ...leadInput, status: 1, budget: 100000 },
      { ...leadInput, status: 4, budget: 200000 },
    ]);
    const first = await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    expect(first.body).toEqual({
      totalLeads: 2,
      averageBudget: 150000,
      reservedLeads: 1,
      conversionRate: 50,
      byStatus: [
        { label: 'Nuevo', count: 1 },
        { label: 'Contactado', count: 0 },
        { label: 'Calificado', count: 0 },
        { label: 'Reservado', count: 1 },
        { label: 'Descartado', count: 0 },
      ],
      bySource: [{ label: 'Facebook', count: 2 }],
      byProject: [{ label: 'Altavista', count: 2 }],
    });
    const second = await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    expect(second.body).toEqual(first.body);
    expect(leadRepo.find).toHaveBeenCalledTimes(1);
  });

  it('rejects anonymous lead access before querying leads', async () => {
    await request(app.getHttpServer()).get('/api/leads/1').expect(401);
    expect(leadRepo.find).not.toHaveBeenCalled();
  });

  it('rejects an unknown bearer token', async () => {
    await request(app.getHttpServer())
      .get('/api/leads/1')
      .set('Authorization', 'Bearer unknown-token')
      .expect(401);
    expect(leadRepo.find).not.toHaveBeenCalled();
  });

  it('lists leads for an authenticated agent', async () => {
    leadRepo.find.mockResolvedValue([{ id: 7, ...leadInput, status: 1 }]);
    const response = await request(app.getHttpServer())
      .get('/api/leads/1?limit=10&offset=0&sort=budget&order=desc')
      .set('Authorization', 'Bearer agent-token')
      .expect(200);
    expect(response.body).toEqual([{ id: 7, ...leadInput, status: 1 }]);
    expect(leadRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 0,
        order: { budget: 'DESC' },
      }),
    );
  });

  it('creates a lead and refreshes the dashboard on the next request', async () => {
    await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    const response = await request(app.getHttpServer())
      .post('/api/leads')
      .set('Authorization', 'Bearer agent-token')
      .send(leadInput)
      .expect(201);
    expect(response.body).toEqual({ id: 7, ...leadInput });
    expect(cache?.syncronized).toBe(false);
    leadRepo.find.mockResolvedValue([{ id: 7, ...leadInput, status: 1 }]);
    const summary = await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    expect(summary.body.totalLeads).toBe(1);
    expect(cache?.syncronized).toBe(true);
    expect(leadRepo.find).toHaveBeenCalledTimes(2);
  });

  it('updates a lead and invalidates the summary', async () => {
    await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    const changes = { status: 4, agent_id: 3, project: 'Centro' };
    leadRepo.findOne.mockResolvedValue({ id: 7, ...leadInput, ...changes });
    const response = await request(app.getHttpServer())
      .patch('/api/leads/7')
      .set('Authorization', 'Bearer agent-token')
      .send(changes)
      .expect(200);
    expect(response.body.status).toBe(4);
    expect(leadRepo.update).toHaveBeenCalledWith('7', changes);
    expect(cache?.syncronized).toBe(false);
  });

  it('forbids deletion by an agent without altering data or cache', async () => {
    await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    await request(app.getHttpServer())
      .delete('/api/leads/7')
      .set('Authorization', 'Bearer agent-token')
      .expect(403);
    expect(leadRepo.delete).not.toHaveBeenCalled();
    expect(cache?.syncronized).toBe(true);
  });

  it('allows a super-admin to delete and invalidates the summary', async () => {
    await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .expect(200);
    await request(app.getHttpServer())
      .delete('/api/leads/7')
      .set('Authorization', 'Bearer admin-token')
      .expect(200)
      .expect({ affected: 1 });
    expect(leadRepo.delete).toHaveBeenCalledWith('7');
    expect(cache?.syncronized).toBe(false);
  });
});
