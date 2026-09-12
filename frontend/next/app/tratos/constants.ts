import { Filtros } from "./interfaces";

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

export const filtroOptions = {
    source: [],
    project: []
} as Filtros;