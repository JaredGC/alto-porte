import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from '@hello-pangea/dnd';
import type { ColumnaId } from '../constants';
import { CardRenderer } from '../partials/CardRenderer';
import type { Listas, Lead } from "../interfaces";
import { updateLead } from '../api';
import { columnas, columnaStatusMap } from "../constants";

export const CilindersRenderer = ({ listas, setListas }: { listas: Listas; setListas: React.Dispatch<React.SetStateAction<Listas>> }) => {
    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'var(--gray-3)' : 'var(--gray-1)',
    });
    
    const reorder = (list: Lead[], startIndex: number, endIndex: number): Lead[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };
    
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
};