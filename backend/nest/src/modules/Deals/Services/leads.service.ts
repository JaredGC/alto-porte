import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '@Deals/Entities/lead.entitiy';
import type { DealListOptions, CreateLeadDto, UpdateLeadDto } from '@Deals/Interfaces/deals.interface';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private leadsRepo: Repository<Lead>,
  ) {}

  async getLeads(status: number, options: DealListOptions = {}) {
    const leads = await this.leadsRepo.find({
      where: { 
        status,
        ...(options.search ? { name: options.search } : {}),
        ...(options.source ? { source: options.source } : {}),
        ...(options.project ? { project: options.project } : {}),
      },
      take: options.limit ? parseInt(options.limit) : undefined,
      skip: options.offset ? parseInt(options.offset) : undefined,
      order: options.sort ? { [options.sort]: options.order === 'desc' ? 'DESC' : 'ASC' } : undefined,
    });
    return leads;
  }

  async getLeadById(id: number) {
    return this.leadsRepo.findOne({ where: { id } });
  }

  async createLead(createLeadDto: CreateLeadDto) {
    const lead = this.leadsRepo.create(createLeadDto);
    return this.leadsRepo.save(lead);
  }

  async updateLead(id: number, updateLeadDto: UpdateLeadDto) {
    await this.leadsRepo.update(id, updateLeadDto);
    return this.getLeadById(id);
  }

  async deleteLead(id: number) {
    return this.leadsRepo.delete(id);
  }

  async getLeadFilters() {
    const sources = await this.leadsRepo
      .createQueryBuilder('lead')
      .select('DISTINCT lead.source', 'source')
      .getRawMany();

    const projects = await this.leadsRepo
      .createQueryBuilder('lead')
      .select('DISTINCT lead.project', 'project')
      .getRawMany();

    return {
      sources: sources.map(s => s.source),
      projects: projects.map(p => p.project),
    };
  }
}