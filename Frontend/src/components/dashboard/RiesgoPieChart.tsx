import {
    PieChart,
    Pie,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

export default function RiesgoPieChart({ data }) {

    const chartData = [
        {
            name: "Riesgo Alto",
            value: data.por_nivel.rojo,
            fill: "#ef4444",
        },
        {
            name: "Riesgo Medio",
            value: data.por_nivel.amarillo,
            fill: "#eab308",
        },
        {
            name: "Riesgo Bajo",
            value: data.por_nivel.verde,
            fill: "#22c55e",
        },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>

                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    innerRadius={70}
                    paddingAngle={5}
                    label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(1)}%`
                    }
                />

                <Tooltip />

                <Legend
                    wrapperStyle={{
                        color: "white",
                        paddingTop: "20px",
                    }}
                />

            </PieChart>
        </ResponsiveContainer>
    );
}