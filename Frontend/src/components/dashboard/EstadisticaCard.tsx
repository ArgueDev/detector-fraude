
export default function EstadisticasCards({ data }) {

    const cards = [
        {
            title: "Total Siniestros",
            value: data.total_siniestros,
        },
        {
            title: "Score Promedio",
            value: data.score_promedio,
        },
        {
            title: "% en Riesgo",
            value: `${data.montos.porcentaje_en_riesgo}%`,
        },
        {
            title: "Total Reclamado",
            value: `$${data.montos.total_reclamado.toLocaleString()}`,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {cards.map((card) => (
                <div
                    key={card.title}
                    className="bg-gray-200 rounded-3xl p-6 shadow-xl"
                >
                    <p className="text-sm font-semibold">
                        {card.title}
                    </p>

                    <h3 className="text-3xl font-bold text-neutro mt-3">
                        {card.value}
                    </h3>
                </div>
            ))}

        </div>
    );
}