import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState } from "react";

const DashboardLayout = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
