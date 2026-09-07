export type DealListOptions = {
  limit?: string;
  offset?: string;
  agent?: string;
  sort?: string;
  order?: string;
  condition?: string;
};

export type CreateLeadDto = {
  name: string;
  email?: string;
  phone: string;
  source: string;
  budget: number;
  project: string;
};

export type UpdateLeadDto = {
  project: string;
  agent_id: number;
  status: number;
};