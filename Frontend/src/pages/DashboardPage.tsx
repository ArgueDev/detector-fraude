import PageHeader from "../components/layout/PageHeader";
import AIExplanationCard from "../components/dashboard/AIExplanationCard";
import CriticalCasesTable from "../components/dashboard/CriticalCasesTable";
import RiskDonutChart from "../components/dashboard/RiskDonutChart";
import StatsCards from "../components/dashboard/StatsCards";
import SuspiciousPatternsChart from "../components/dashboard/SuspiciousPatternsChart";
import TopProvidersChart from "../components/dashboard/TopProvidersChart";
import { heroKpiBadges, topCriticalCases } from "../mock/dashboardData";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Centro de control antifraude"
        description="Visualiza y prioriza siniestros de alto riesgo con scoring inteligente, alertas en tiempo real y análisis asistido por IA."
        badges={heroKpiBadges}
      />

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RiskDonutChart />
        <AIExplanationCard />
      </div>

      <CriticalCasesTable cases={topCriticalCases} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TopProvidersChart />
        <SuspiciousPatternsChart />
      </div>
    </div>
  );
}
