// Interfaces made by AI, using GPT 6 Astra Medium
// Prompt: Define the dashboard response with lead metrics and counts by status, source, and project.

export interface DashboardGroup {
  label: string;
  count: number;
}

export interface DashboardResponse {
  totalLeads: number;
  averageBudget: number;
  reservedLeads: number;
  conversionRate: number;
  byStatus: DashboardGroup[];
  bySource: DashboardGroup[];
  byProject: DashboardGroup[];
}
