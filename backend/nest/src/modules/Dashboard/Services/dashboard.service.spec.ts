import { Repository } from 'typeorm';
import { Dashboard } from '../Entities/dashboard.entitiy';
import { Lead } from '@Deals/Entities/lead.entitiy';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const dashboardRepo = {
    findOne: jest.fn(),
    create: jest.fn((data) => ({ id: 1, ...data })),
    save: jest.fn(async (data) => data),
  };
  const leadsRepo = { find: jest.fn() };
  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardRepo.findOne.mockResolvedValue(null);
    leadsRepo.find.mockResolvedValue([]);
    service = new DashboardService(
      dashboardRepo as unknown as Repository<Dashboard>,
      leadsRepo as unknown as Repository<Lead>,
    );
  });

  it('returns zero metrics and empty source/project groups without leads', async () => {
    expect(await service.makeDashboard()).toEqual({
      totalLeads: 0,
      averageBudget: 0,
      reservedLeads: 0,
      conversionRate: 0,
      byStatus: [
        { label: 'Nuevo', count: 0 },
        { label: 'Contactado', count: 0 },
        { label: 'Calificado', count: 0 },
        { label: 'Reservado', count: 0 },
        { label: 'Descartado', count: 0 },
      ],
      bySource: [],
      byProject: [],
    });
  });

  it('calculates metrics and groups across different budgets and all statuses', async () => {
    leadsRepo.find.mockResolvedValue([
      { status: 1, budget: 100000, source: 'Facebook', project: 'Altavista' },
      { status: 2, budget: 200000, source: 'Web', project: 'Altavista' },
      { status: 3, budget: 300000, source: 'Facebook', project: 'Centro' },
      { status: 4, budget: 400000, source: 'Web', project: 'Centro' },
      { status: 5, budget: 0, source: 'Referido', project: 'Altavista' },
    ]);
    const result = await service.makeDashboard();
    expect(result).toMatchObject({
      totalLeads: 5,
      averageBudget: 200000,
      reservedLeads: 1,
      conversionRate: 20,
    });
    expect(result.byStatus).toHaveLength(5);
    expect(result.byStatus.every((group) => group.count === 1)).toBe(true);
    expect(result.bySource).toEqual(
      expect.arrayContaining([
        { label: 'Facebook', count: 2 },
        { label: 'Web', count: 2 },
        { label: 'Referido', count: 1 },
      ]),
    );
    expect(result.bySource).toHaveLength(3);
    expect(result.byProject).toEqual(
      expect.arrayContaining([
        { label: 'Altavista', count: 3 },
        { label: 'Centro', count: 2 },
      ]),
    );
    expect(result.byProject).toHaveLength(2);
  });

  it('preserves fractional averages and conversion rates', async () => {
    leadsRepo.find.mockResolvedValue(
      [1, 2, 4].map((status, index) => ({
        status,
        budget: index === 0 ? 100 : 0,
        source: 'Web',
        project: 'A',
      })),
    );
    const result = await service.makeDashboard();
    expect(result.averageBudget).toBeCloseTo(100 / 3);
    expect(result.conversionRate).toBeCloseTo(100 / 3);
  });

  it('returns a valid cached summary without reading leads', async () => {
    const cached = { totalLeads: 42 };
    dashboardRepo.findOne.mockResolvedValue({
      id: 1,
      json: cached,
      syncronized: true,
    });
    expect(await service.getSummary()).toBe(cached);
    expect(dashboardRepo.findOne).toHaveBeenCalledWith({
      where: { syncronized: true },
    });
    expect(leadsRepo.find).not.toHaveBeenCalled();
    expect(dashboardRepo.save).not.toHaveBeenCalled();
  });

  it('generates and saves the summary when the cache is missing', async () => {
    const summary = await service.getSummary();
    expect(summary.totalLeads).toBe(0);
    expect(leadsRepo.find).toHaveBeenCalledTimes(1);
    expect(dashboardRepo.save).toHaveBeenCalledWith({
      id: 1,
      json: summary,
      syncronized: true,
    });
  });

  it('invalidates the current summary', async () => {
    dashboardRepo.findOne.mockResolvedValue({
      id: 8,
      json: {},
      syncronized: true,
    });
    await service.unableDashboard();
    expect(dashboardRepo.save).toHaveBeenCalledWith({
      id: 8,
      json: {},
      syncronized: false,
    });
  });

  it('does not create a cache entry when invalidating an absent summary', async () => {
    await expect(service.unableDashboard()).resolves.toBeUndefined();
    expect(dashboardRepo.save).not.toHaveBeenCalled();
  });

  it('does not save a summary when reading leads fails', async () => {
    leadsRepo.find.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(service.getSummary()).rejects.toThrow('Database unavailable');
    expect(dashboardRepo.save).not.toHaveBeenCalled();
  });
});
