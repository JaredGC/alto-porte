import { Filtros } from "../interfaces";

export const FiltrosRenderer = ({filtros, setFiltros}: {filtros: Filtros, setFiltros: React.Dispatch<React.SetStateAction<Filtros>>}) => {
    const setFiltro = (type: "source" | "project", value: string) => {
        setFiltros(prev => {
            const shouldActivate = !prev[type].find(option => option.value === value)?.active;

            return {
                ...prev,
                source: prev.source.map(option => ({
                    ...option,
                    active: type === "source"
                        ? shouldActivate && option.value === value
                        : option.active,
                })),
                project: prev.project.map(option => ({
                    ...option,
                    active: type === "project"
                        ? shouldActivate && option.value === value
                        : option.active,
                })),
            };
        });
    };
    return (
        <div className="flex gap-8">
            <div className="flex flex-col gap-2">
                <p>Origen</p>
                <div className="flex gap-2">
                    {filtros.source.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFiltro("source", option.value)}
                            className={`px-2 py-1 text-xs rounded-full ${option.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {option.value}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p>Proyecto</p>
                <div className="flex gap-2">
                    {filtros.project.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFiltro("project", option.value)}
                            className={`px-2 py-1 text-xs rounded-full ${option.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            {option.value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};