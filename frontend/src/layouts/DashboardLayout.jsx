import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({
  children,
}) => {
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

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
        <Navbar
          setSidebarOpen={
            setSidebarOpen
          }
        />

        <main
          className="
          flex-1
          p-4
          md:p-8
          bg-gray-100
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;