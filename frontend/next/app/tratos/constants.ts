export const columnas = [
    { id: "nuevos", nombre: "Nuevos", status: 1 },
    { id: "contactados", nombre: "Contactados", status: 2 },
    { id: "calificados", nombre: "Calificados", status: 3 },
    { id: "reservados", nombre: "Reservados", status: 4 },
    { id: "descartados", nombre: "Descartados", status: 5 },
] as const;

export const columnaStatusMap = {
    nuevos: 1,
    contactados: 2,
    calificados: 3,
    reservados: 4,
    descartados: 5,
} as const;

export type ColumnaId = typeof columnas[number]["id"];

export type Filtros = {
    map(arg0: ([filterType, options]: [keyof Filtros, Filtros[keyof Filtros]]) => (keyof Filtros | { active: boolean; value: string; }[])[]): Filtros;
    source: {
        value: string;
        active: boolean;
    }[];
    project: {
        value: string;
        active: boolean;
    }[];
}

export const filtroOptions = {
    source: [
        {
            value: "Facebook",
            active: false,
        },
        {
            value: "Instagram",
            active: false,
        },
        {
            value: "Website",
            active: false,
        }
    ],
    project: [
        {
            value: "Residencial Altavista",
            active: false,
        },
        {
            value: "Vista Verde",
            active: false,
        },
        {
            value: "Torres del Valle",
            active: false,
        }
    ]
} as Filtros;