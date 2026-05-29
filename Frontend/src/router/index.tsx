import { Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AIAssistantPage from "../pages/AIAssistantPage";
import AnalisisRiesgoPage from "../pages/AnalisisRiesgoPage";
import CasosCriticosPage from "../pages/CasosCriticosPage";
import CriticalCasesPage from "../pages/CriticalCasesPage";
import DashboardPage from "../pages/DashboardPage";
import ReportsPage from "../pages/ReportsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analisis-riesgo" element={<AnalisisRiesgoPage />} />
        <Route path="casos" element={<CriticalCasesPage />} />
        <Route path="casos-criticos" element={<CasosCriticosPage />} />
        <Route path="ia" element={<AIAssistantPage />} />
        <Route path="reportes" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}
