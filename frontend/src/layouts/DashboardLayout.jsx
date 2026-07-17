import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";

const DashboardLayout = ({
  children,
}) => {
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);
  const dashboardRef = useRef(null);
  const location = useLocation();

  const handleReset = () => dashboardRef.current?.reset();

  return (
    <div
      className="
      flex
      min-h-screen
      bg-gray-100
      text-gray-800
      "
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        onReset={handleReset}
        setSidebarOpen={
          setSidebarOpen
        }
      />

      <div
        className="
        flex-1
        flex
        flex-col
        "
      >
        {location.pathname !== '/history' && (
          <Navbar
            setSidebarOpen={
              setSidebarOpen
            }
          />
        )}

        <main
          className="
          flex-1
          p-4
          md:p-8
          bg-gray-100
          "
        >
          {children(dashboardRef)}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;