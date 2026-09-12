import { getUserData } from "../lib/session";
import type { Filtros, FiltrosResponse, Trato } from "./interfaces";

export const getFiltrosOptions = async () => {
    const userData = await getUserData();

    const filtrosData: FiltrosResponse = await fetch(`http://localhost:3002/api/leads/filters`, {
        method: "POST",
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return filtrosData;
};

export const getLeads = async (status: number, filtros: Filtros) => {
    const userData = await getUserData();

    const tratos: Trato[] = await fetch(`http://localhost:3002/api/leads/${status}?project=${filtros.project.find(option => option.active)?.value || ''}&source=${filtros.source.find(option => option.active)?.value || ''}`, {
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return tratos;
}

export const updateLead = async (id: string, status: number) => {
    const userData = await getUserData();

    await fetch(`http://localhost:3002/api/leads/${id}`, {
        method: "PATCH",
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });
};