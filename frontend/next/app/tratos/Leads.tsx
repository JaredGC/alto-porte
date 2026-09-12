"use client";

import { useEffect, useState } from "react";
import type { Listas, Filtros, CreateLeadDto } from "./interfaces";
import { FiltrosRenderer } from './partials/FiltrosRenderer';
import { getFiltrosOptions, getLeads, createLead } from './api';
import { filtroOptions } from "./constants";
import { CreateLeadForm } from './partials/CreateLeadForm';
import { CilindersRenderer } from "./partials/CilindersRenderer";

export default function Leads() {
    const [filtros, setFiltros] = useState<Filtros>(filtroOptions);
    const [listas, setListas] = useState<Listas>({
        nuevos: [],
        contactados: [],
        calificados: [],
        reservados: [],
        descartados: [],
    });

    const newLead = async (leadData: CreateLeadDto) => {
        const createdLead = await createLead(leadData);
        console.log({createdLead});
        setListas(prevListas => ({
            ...prevListas,
            nuevos: [
                createdLead,
                ...prevListas.nuevos
            ],
        }));
    };

    useEffect(() => {
        const fetchFiltros = async () => {
            const filtrosData = await getFiltrosOptions();
            setFiltros({
                source: filtrosData.sources.map(value => ({ value, active: false })),
                project: filtrosData.projects.map(value => ({ value, active: false })),
            });
        };

        fetchFiltros();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const [
                nuevos,
                contactados,
                calificados,
                reservados,
                descartados
            ] = await Promise.all([
                getLeads(1, filtros),
                getLeads(2, filtros),
                getLeads(3, filtros),
                getLeads(4, filtros),
                getLeads(5, filtros),
            ]);

            setListas({
                nuevos,
                contactados,
                calificados,
                reservados,
                descartados,
            });
        };

        fetchData();
    }, [filtros]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between">
                <FiltrosRenderer filtros={filtros} setFiltros={setFiltros} />
                <CreateLeadForm onSubmit={newLead} />
            </div>
            <CilindersRenderer
                listas={listas}
                setListas={setListas}
            />
        </div>
    );
}