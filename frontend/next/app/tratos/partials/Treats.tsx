"use client";

import { ChevronLeft } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useEffect, useState } from "react";
import { getUserData } from "@/app/lib/session";

type Trato = {
    id: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    status: string;
    budget: number;
    project: string;
}

const getNuevos = async () => {
    const userData = await getUserData();
    const response = await fetch("http://localhost:3002/api/leads/1", {
        headers: {
            Authorization: `Bearer ${userData?.userAccessToken}`,
        },
    });
    const tratos: Trato[] = await response.json();
    return tratos;
}

const getContactados = async () => {
    const userData = await getUserData();
    const tratos: Trato[] = await fetch("http://localhost:3002/api/leads/2", {
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return tratos;
}

const getCalificados = async () => {
    const userData = await getUserData();
    const tratos: Trato[] = await fetch("http://localhost:3002/api/leads/3", {
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return tratos;
}

const getReservados = async () => {
    const userData = await getUserData();
    const tratos: Trato[] = await fetch("http://localhost:3002/api/leads/4", {
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return tratos;

};

const getDescartados = async () => {
    const userData = await getUserData();
    const tratos: Trato[] = await fetch("http://localhost:3002/api/leads/5", {
        headers: {
            "authorization": `Bearer ${userData?.userAccessToken}`
        }
    }).then(res => res.json());

    return tratos;
};

const reorder = (list: Trato[], startIndex: number, endIndex: number): Trato[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? 'var(--gray-3)' : 'var(--gray-1)',
});

export default function Treats() {
    const [nuevosCards, setNuevosCards] = useState<Trato[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tratos = await getNuevos();
            setNuevosCards(tratos);
        };
        fetchData();
    }, []);
    const [contactadosCards, setContactadosCards] = useState<Trato[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tratos = await getContactados();
            setContactadosCards(tratos);
        };
        fetchData();
    }, []);
    const [calificadosCards, setCalificadosCards] = useState<Trato[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tratos = await getCalificados();
            setCalificadosCards(tratos);
        };
        fetchData();
    }, []);
    const [reservadosCards, setReservadosCards] = useState<Trato[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tratos = await getReservados();
            setReservadosCards(tratos);
        };
        fetchData();
    }, []);

    const [descartadosCards, setDescartadosCards] = useState<Trato[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tratos = await getDescartados();
            setDescartadosCards(tratos);
        };
        fetchData();
    }, []);
    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        console.log({result});

        if (result.destination.droppableId === result.source.droppableId) {
            if (result.source.droppableId === "nuevos") {
                const items = reorder(
                    nuevosCards,
                    result.source.index,
                    result.destination.index
                );
                setNuevosCards(items);
            } else if (result.source.droppableId === "contactados") {
                const items = reorder(
                    contactadosCards,
                    result.source.index,
                    result.destination.index
                );
                setContactadosCards(items);
            } else if (result.source.droppableId === "calificados") {
                const items = reorder(
                    calificadosCards,
                    result.source.index,
                    result.destination.index
                );
                setCalificadosCards(items);
            } else if (result.source.droppableId === "reservados") {
                const items = reorder(
                    reservadosCards,
                    result.source.index,
                    result.destination.index
                );
                setReservadosCards(items);
            } else if (result.source.droppableId === "descartados") {
                const items = reorder(
                    descartadosCards,
                    result.source.index,
                    result.destination.index
                );
                setDescartadosCards(items);
            }
        } else {
            let sourceList = nuevosCards;
            let setSourceList = setNuevosCards;
            let destinationList = nuevosCards;
            let setDestinationList = setNuevosCards;
            if (result.source.droppableId === "nuevos") {
                sourceList = nuevosCards;
                setSourceList = setNuevosCards;
            } else if (result.source.droppableId === "contactados") {
                sourceList = contactadosCards;
                setSourceList = setContactadosCards;
            } else if (result.source.droppableId === "calificados") {
                sourceList = calificadosCards;
                setSourceList = setCalificadosCards;
            } else if (result.source.droppableId === "reservados") {
                sourceList = reservadosCards;
                setSourceList = setReservadosCards;
            } else if (result.source.droppableId === "descartados") {
                sourceList = descartadosCards;
                setSourceList = setDescartadosCards;
            }

            if (result.destination.droppableId === "nuevos") {
                destinationList = nuevosCards;
                setDestinationList = setNuevosCards;
            } else if (result.destination.droppableId === "contactados") {
                destinationList = contactadosCards;
                setDestinationList = setContactadosCards;
            } else if (result.destination.droppableId === "calificados") {
                destinationList = calificadosCards;
                setDestinationList = setCalificadosCards;
            } else if (result.destination.droppableId === "reservados") {
                destinationList = reservadosCards;
                setDestinationList = setReservadosCards;
            } else if (result.destination.droppableId === "descartados") {
                destinationList = descartadosCards;
                setDestinationList = setDescartadosCards;
            }
            const sourceClone = Array.from(sourceList);
            const destClone = Array.from(destinationList);
            const [removed] = sourceClone.splice(result.source.index, 1);
            destClone.splice(result.destination.index, 0, removed);
            setSourceList(sourceClone);
            setDestinationList(destClone);

            
        }
    };
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-2">
                <Droppable droppableId="nuevos">
                    {(provided, snapshot) => (
                        <div
                            className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            <div className="grid gap-1 pl-1.5 mb-3">
                                <p className="font-medium text-[16px]">
                                    Nuevos
                                </p>
                                <p className="font-light text-(--gray-2) text-xs">
                                    {nuevosCards?.length} Tratos
                                </p>
                            </div>
                            {nuevosCards.length > 0 && nuevosCards.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.name}
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
                <Droppable droppableId="contactados">
                    {(provided, snapshot) => (
                        <div
                            className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            <div className="grid gap-1 pl-1.5 mb-3">
                                <p className="font-medium text-[16px]">
                                    Contactados
                                </p>
                                <p className="font-light text-(--gray-2) text-xs">
                                    {contactadosCards?.length} Tratos
                                </p>
                            </div>
                            {contactadosCards.length > 0 && contactadosCards.map((item, index) => (
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
                <Droppable droppableId="calificados">
                    {(provided, snapshot) => (
                        <div
                            className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            <div className="grid gap-1 pl-1.5 mb-3">
                                <p className="font-medium text-[16px]">
                                    Calificados
                                </p>
                                <p className="font-light text-(--gray-2) text-xs">
                                    {calificadosCards.length} Tratos
                                </p>
                            </div>
                            {calificadosCards.length > 0 && calificadosCards.map((item, index) => (
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
                <Droppable droppableId="reservados">
                    {(provided, snapshot) => (
                        <div
                            className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            <div className="grid gap-1 pl-1.5 mb-3">
                                <p className="font-medium text-[16px]">
                                    Reservados
                                </p>
                                <p className="font-light text-(--gray-2) text-xs">
                                    {reservadosCards?.length} Tratos
                                </p>
                            </div>
                            {reservadosCards.length > 0 && reservadosCards.map((item, index) => (
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
                <Droppable droppableId="descartados">
                    {(provided, snapshot) => (
                        <div
                            className="w-[20%] rounded-lg gap-3 py-2 px-1.5 transition"
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            <div className="grid gap-1 pl-1.5 mb-3">
                                <p className="font-medium text-[16px]">
                                    Descartados
                                </p>
                                <p className="font-light text-(--gray-2) text-xs">
                                    {descartadosCards.length} Tratos
                                </p>
                            </div>
                            {descartadosCards.length > 0 && descartadosCards.map((item, index) => (
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
            </div>
        </DragDropContext>
    );
}

const CardRenderer = (card: Trato) => {
    return (
        <div key={card.id} onClick={() => {
            window.location.href = `/tratos/${card.id}`;
        }} className="rounded-md bg-white w-full h-full cursor-pointer px-2 py-1.5 shadow-sm hover:shadow-lg flex transition hover:-translate-y-0.5 group/card">
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
                        <ChevronLeft height={12} width={12} color="white" className="scale-100 m-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}