export type Trato = {
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
    nuevos: Trato[];
    contactados: Trato[];
    calificados: Trato[];
    reservados: Trato[];
    descartados: Trato[];
}

export type Filtros = {
    source: { value: string; active: boolean }[];
    project: { value: string; active: boolean }[];
};

export type FiltrosResponse = {
    sources: string[];
    projects: string[];
}