import { Filtros } from "./interfaces";
import * as Yup from 'yup';

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

export const leadValidationSchema = Yup.object({
    name: Yup.string().required('El nombre es obligatorio'),
    email: Yup.string().email('Ingresa un correo válido'),
    phone: Yup.string().required('El teléfono es obligatorio'),
    source: Yup.string().required('La fuente es obligatoria'),
    budget: Yup.number()
        .typeError('El presupuesto debe ser un número')
        .min(0, 'El presupuesto no puede ser negativo')
        .required('El presupuesto es obligatorio'),
    project: Yup.string().required('El proyecto es obligatorio'),
});