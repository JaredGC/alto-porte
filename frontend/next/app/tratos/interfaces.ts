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