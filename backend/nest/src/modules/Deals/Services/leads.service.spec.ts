import { Repository } from 'typeorm';
import { Lead } from '../Entities/lead.entitiy';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new LeadsService(repo as unknown as Repository<Lead>);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters by status and converts pagination and descending order', async () => {
    const leads = [{ id: 4, status: 2 }];
    repo.find.mockResolvedValueOnce(leads);
    expect(
      await service.getLeads(2, {
        limit: '10',
        offset: '20',
        sort: 'budget',
        order: 'desc',
      }),
    ).toBe(leads);
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: 2 },
      take: 10,
      skip: 20,
      order: { budget: 'DESC' },
    });
  });

  it('defaults a requested sort to ascending', async () => {
    await service.getLeads(1, { sort: 'created_at' });
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ order: { created_at: 'ASC' } }),
    );
  });

  it('returns null for an unknown lead', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.getLeadById(999)).resolves.toBeNull();
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  it('persists a new lead and returns its generated ID', async () => {
    const input = {
      name: 'Ana',
      phone: '5550000',
      source: 'Web',
      budget: 150000,
      project: 'Altavista',
    };
    repo.save.mockResolvedValueOnce({ id: 7, ...input });
    await expect(service.createLead(input)).resolves.toEqual({
      id: 7,
      ...input,
    });
    expect(repo.save).toHaveBeenCalledWith(input);
  });

  it('returns the persisted lead after updating it', async () => {
    const changes = { status: 4, agent_id: 3, project: 'Centro' };
    repo.findOne.mockResolvedValueOnce({ id: 7, ...changes });
    await expect(service.updateLead(7, changes)).resolves.toEqual({
      id: 7,
      ...changes,
    });
    expect(repo.update).toHaveBeenCalledWith(7, changes);
  });

  it('does not fetch a lead after a failed update', async () => {
    repo.update.mockRejectedValueOnce(new Error('Update failed'));
    await expect(
      service.updateLead(7, { status: 4, agent_id: 3, project: 'Centro' }),
    ).rejects.toThrow('Update failed');
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('returns the deletion result', async () => {
    repo.delete.mockResolvedValueOnce({ affected: 1 });
    await expect(service.deleteLead(7)).resolves.toEqual({ affected: 1 });
    expect(repo.delete).toHaveBeenCalledWith(7);
  });
});
