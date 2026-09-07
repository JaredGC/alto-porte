import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from '@Dashboard/Entities/dashboard.entitiy';
import { Lead } from '@Deals/Entities/lead.entitiy';
import type { DashboardResponse } from '@Dashboard/Interfaces/dashboard.interface';
  
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Dashboard) private dashboardRepo: Repository<Dashboard>,
    @InjectRepository(Lead) private leadsRepo: Repository<Lead>,
  ) {}

  async getSummary() {
    const isDashboard = await this.dashboardRepo.find({
      where: {
        syncronized: true,
      },
    });

    if (isDashboard) return isDashboard[0].json;

    const newDashboardJson = await this.makeDashboard();

    const newDashboard = this.dashboardRepo.create({
      json: newDashboardJson,
      syncronized: true,
    });
    await this.dashboardRepo.save(newDashboard);
    return newDashboardJson;
  }

  async unableDashboard() {
    const dashboard = await this.dashboardRepo.find({
      where: {
        syncronized: true,
      },
    });
    if (dashboard.length > 0) {
      dashboard[0].syncronized = false;
      await this.dashboardRepo.save(dashboard[0]);
    }
  }

  // Code made by AI, using GPT 6
  // Prompt: Generate a comprehensive dashboard summary based on the current leads data. [example json adjunted]
  async makeDashboard(): Promise<DashboardResponse> {
    const leads = await this.leadsRepo.find({
      select: { status: true, budget: true, source: true, project: true },
    });
    const statuses = [
      { status: 1, label: 'Nuevo' },
      { status: 2, label: 'Contactado' },
      { status: 3, label: 'Calificado' },
      { status: 4, label: 'Reservado' },
      { status: 5, label: 'Descartado' },
    ];
    const statusCounts = new Map<number, number>();
    const sourceCounts = new Map<string, number>();
    const projectCounts = new Map<string, number>();
    let totalBudget = 0;

    for (const lead of leads) {
      totalBudget += lead.budget;
      statusCounts.set(lead.status, (statusCounts.get(lead.status) ?? 0) + 1);
      sourceCounts.set(lead.source, (sourceCounts.get(lead.source) ?? 0) + 1);
      projectCounts.set(lead.project, (projectCounts.get(lead.project) ?? 0) + 1);
    }

    const totalLeads = leads.length;
    const reservedLeads = statusCounts.get(4) ?? 0;

    return {
      totalLeads,
      averageBudget: totalLeads === 0 ? 0 : totalBudget / totalLeads,
      reservedLeads,
      conversionRate: totalLeads === 0 ? 0 : (reservedLeads / totalLeads) * 100,
      byStatus: statuses.map(({ status, label }) => ({
        label,
        count: statusCounts.get(status) ?? 0,
      })),
      bySource: [...sourceCounts].map(([label, count]) => ({ label, count })),
      byProject: [...projectCounts].map(([label, count]) => ({ label, count })),
    };
  }
}
