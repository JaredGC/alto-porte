"use client";

import { ChevronLeft } from "lucide-react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from '@hello-pangea/dnd';
import { useEffect, useState } from "react";
import { getUserData } from "@/app/lib/session";
import type { Trato, Listas } from "../interfaces";
import type { ColumnaId } from "../constants";
import { columnas, columnaStatusMap } from "../constants";

const CardRenderer = (card: Trato) => {
    return (
        <div
            key={card.id}
            onClick={() => {
                window.location.href = `/tratos/${card.id}`;
            }}
            className="rounded-md bg-white w-full h-full cursor-pointer px-2 py-1.5 shadow-sm hover:shadow-lg flex transition hover:-translate-y-0.5 group/card"
        >
            <div className="flex flex-col gap-1.25 w-full">
                <p className="font-medium text-sm">
                    {card.name}
                </p>

                <p className="font-light text-(--gray-2) text-xs max-w-33 truncate pb-0.5">
                    ${card.budget}
                </p>

                <p className="font-medium text-(--gray-2) text-xs flex gap-1">
                    {card.project} - {card.source}
                </p>
            </div>

            <div className="items-center justify-center flex w-auto h-auto ml-auto">
                <div className="hover:bg-(--gray-1) transition group-hover/card:ring-1 ring-(--gray-3) rounded-full w-5.5 h-5.5 flex items-center justify-center">
                    <div className="bg-[#d8d8db] hover:bg-[#65686f] rounded-full w-4 h-4 flex items-center justify-end">
                        <ChevronLeft
                            height={12}
                            width={12}
                            color="white"
                            className="scale-100 m-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Treats() {
    const [listas, setListas] = useState<Listas>({
        nuevos: [],
        contactados: [],
        calificados: [],
        reservados: [],
        descartados: [],
    });

    const getLeads = async (status: number) => {
        const userData = await getUserData();

        const tratos: Trato[] = await fetch(`http://localhost:3002/api/leads/${status}`, {
            headers: {
                "authorization": `Bearer ${userData?.userAccessToken}`
            }
        }).then(res => res.json());

        return tratos;
    }

    const updateLead = async (id: string, status: number) => {
        const userData = await getUserData();

        console.log({id, status});

        await fetch(`http://localhost:3002/api/leads/${id}`, {
            method: "PATCH",
            headers: {
                "authorization": `Bearer ${userData?.userAccessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });
    };

    const reorder = (list: Trato[], startIndex: number, endIndex: number): Trato[] => {
        console.log({startIndex, endIndex});
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'var(--gray-3)' : 'var(--gray-1)',
    });

    useEffect(() => {
        const fetchData = async () => {
            const [
                nuevos,
                contactados,
                calificados,
                reservados,
                descartados
            ] = await Promise.all([
                getLeads(1),
                getLeads(2),
                getLeads(3),
                getLeads(4),
                getLeads(5),
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
    }, []);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const sourceId = result.source.droppableId as ColumnaId;
        const destinationId = result.destination.droppableId as ColumnaId;

        if (sourceId === destinationId) {
            const items = reorder(
                listas[sourceId],
                result.source.index,
                result.destination.index
            );

            setListas({
                ...listas,
                [sourceId]: items
            });

            return;
        } else {
            updateLead(result.draggableId, columnaStatusMap[destinationId]);
        }

        const sourceList = listas[sourceId];
        const destinationList = listas[destinationId];

        const [removed] = sourceList.splice(result.source.index, 1);

        destinationList.splice(
            result.destination.index,
            0,
            removed
        );

        setListas({
            ...listas,
            [sourceId]: sourceList,
            [destinationId]: destinationList
        });

    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-2">
                {columnas.map((columna) => {
                    const cards = listas[columna.id];

                    return (
                        <Droppable
                            key={columna.id}
                            droppableId={columna.id}
                        >
                            {(provided, snapshot) => (
                                <div
                                    className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                    {...provided.droppableProps}
                                >
                                    <div className="grid gap-1 pl-1.5 mb-3">
                                        <p className="font-medium text-[16px]">
                                            {columna.nombre}
                                        </p>

                                        <p className="font-light text-(--gray-2) text-xs">
                                            {cards.length} Tratos
                                        </p>
                                    </div>

                                    {cards.length > 0 && cards.map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={String(item.id)}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.dragHandleProps}
                                                    {...provided.draggableProps}
                                                    className="mt-1"
                                                >
                                                    {CardRenderer(item)}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}

                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    );
                })}
            </div>
        </DragDropContext>
    );
}