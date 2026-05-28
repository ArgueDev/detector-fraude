import { dashboardStats } from "../../mock/dashboardData";
import StatsCard from "./StatsCard";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <StatsCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}
