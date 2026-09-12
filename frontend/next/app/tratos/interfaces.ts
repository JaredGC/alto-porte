export type Lead = {
    id: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: string;
    budget: number;
    project: string;
}

export type Listas = {
    nuevos: Lead[];
    contactados: Lead[];
    calificados: Lead[];
    reservados: Lead[];
    descartados: Lead[];
}

export type Filtros = {
    source: { value: string; active: boolean }[];
    project: { value: string; active: boolean }[];
};

export type FiltrosResponse = {
    sources: string[];
    projects: string[];
}

export type CreateLeadDto = {
  name: string;
  email?: string;
  phone: string;
  source: string;
  budget: number;
  project: string;
};