import { DataSource, EntityManager } from 'typeorm';
import { Lead } from '@Deals/Entities/lead.entitiy';
import { Dashboard } from '@Dashboard/Entities/dashboard.entitiy';
import { seedLeads } from './leads.seed';
import { leadsData } from './leads.data';

describe('Lead seeder', () => {
  const leadRepo = { find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const dashboardRepo = { update: jest.fn() };
  const manager = {
    getRepository: jest.fn((entity) => {
      if (entity === Lead) return leadRepo;
      if (entity === Dashboard) return dashboardRepo;
      throw new Error('Unexpected repository');
    }),
  };
  const dataSource = {
    transaction: jest.fn(
      async (work: (manager: EntityManager) => Promise<unknown>) =>
        work(manager as unknown as EntityManager),
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    leadRepo.find.mockResolvedValue([]);
    leadRepo.create.mockImplementation((data) => data);
  });

  it('inserts all ten leads with numeric statuses and the original dates', async () => {
    await expect(
      seedLeads(dataSource as unknown as DataSource),
    ).resolves.toEqual({ created: 10, skipped: 0 });
    const saved = leadRepo.save.mock.calls[0][0] as Lead[];
    expect(saved).toHaveLength(10);
    expect(saved.map((lead) => lead.status)).toEqual([
      1, 2, 3, 4, 1, 5, 3, 4, 2, 3,
    ]);
    expect(
      saved.reduce((sum, lead) => sum + lead.budget, 0) / saved.length,
    ).toBe(174000);
    saved.forEach((lead, index) => {
      expect(lead.email).toBe(leadsData[index].email);
      expect(lead.created_at.getFullYear()).toBe(2026);
      expect(lead.created_at.getMonth()).toBe(7);
      expect(lead.created_at.getDate()).toBe(
        Number(leadsData[index].createdAt.slice(-2)),
      );
      expect(lead).not.toHaveProperty('createdAt');
    });
    expect(dashboardRepo.update).toHaveBeenCalledWith(
      { syncronized: true },
      { syncronized: false },
    );
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it('skips existing emails without changing those leads', async () => {
    leadRepo.find.mockResolvedValueOnce([{ email: 'carlos@example.com' }]);
    await expect(
      seedLeads(dataSource as unknown as DataSource),
    ).resolves.toEqual({ created: 9, skipped: 1 });
    const saved = leadRepo.save.mock.calls[0][0] as Lead[];
    expect(saved.some((lead) => lead.email === 'carlos@example.com')).toBe(
      false,
    );
  });

  it('does not insert or invalidate the cache when all leads already exist', async () => {
    leadRepo.find.mockResolvedValueOnce(
      leadsData.map(({ email }) => ({ email })),
    );
    await expect(
      seedLeads(dataSource as unknown as DataSource),
    ).resolves.toEqual({ created: 0, skipped: 10 });
    expect(leadRepo.save).not.toHaveBeenCalled();
    expect(dashboardRepo.update).not.toHaveBeenCalled();
  });

  it('propagates insertion failures to the transaction', async () => {
    leadRepo.save.mockRejectedValueOnce(new Error('Insert failed'));
    await expect(
      seedLeads(dataSource as unknown as DataSource),
    ).rejects.toThrow('Insert failed');
    expect(dashboardRepo.update).not.toHaveBeenCalled();
  });
});
