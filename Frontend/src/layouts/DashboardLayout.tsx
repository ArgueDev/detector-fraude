import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#0b1120] flex">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden min-w-0 lg:ml-72">
        <Navbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
