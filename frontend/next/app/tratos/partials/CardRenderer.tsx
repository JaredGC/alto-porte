import { ChevronLeft } from "lucide-react";
import { Trato } from "../interfaces";

export const CardRenderer = (card: Trato) => {
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