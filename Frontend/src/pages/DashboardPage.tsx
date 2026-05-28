
import EstadisticasCards from "../components/dashboard/EstadisticaCard";
import RiesgoPieChart from "../components/dashboard/RiesgoPieChart";

import useEstadisticas  from "../hooks/useEstadistica";

export default function DashboardPage() {

    const {
        data,
        isLoading,
        isError,
    } = useEstadisticas();

    if (isLoading) {
        return <p className="text-white">Cargando...</p>;
    }

    if (isError) {
        return <p className="text-red-500">Error al cargar datos</p>;
    }

    return (
        <div className="space-y-10">

            <div>
                <h1 className="text-secundario mt-2">
                    Métricas generales del semáforo de riesgo
                </h1>
            </div>

            <EstadisticasCards data={data} />

            <div className="bg-gray-200 rounded-3xl p-8 shadow-xl">

                <h2 className="text-2xl font-semibold text-secundario mb-8">
                    Distribución de Riesgo
                </h2>

                <RiesgoPieChart data={data} />

            </div>

        </div>
    );
}