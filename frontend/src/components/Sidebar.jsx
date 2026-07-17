import {
  FaHome,
  FaHistory,
  FaCode,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({
  sidebarOpen,
  onReset,
  setSidebarOpen,
}) => {
  const { logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const handleNewReviewClick = () => {
    if (onReset) {
      onReset();
    }
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:sticky
          top-0 left-0
          z-50
          w-72
          h-screen
          bg-white dark:bg-slate-900
          text-white
          p-6
          flex
          flex-col
          transform
          transition-transform
          duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-emerald-400">
            AI Reviewer
          </h1>

          <p className="text-gray-400 mt-2">
            Code Review Assistant
          </p>
          <div className="mt-5 border-t border-slate-700" />
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          <Link
            to="/"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex
              items-center
              gap-3
              p-4
              rounded-xl
              text-slate-700 dark:text-white bg-slate-100 dark:bg-teal-950/70
              border-b
              border-slate-800
              hover:bg-teal-800
              transition
            "
          >
            <FaHome />
            Dashboard
          </Link>

          <Link
            to="/"
            onClick={handleNewReviewClick}
            className="flex
              items-center
              gap-3
              p-4
              rounded-xl
              text-slate-700 dark:text-white bg-slate-100 dark:bg-teal-950/70
              border-b
              border-slate-800
              hover:bg-teal-800
              transition
            "
          >
            <FaCode />
            New Review
          </Link>
          <Link
            to="/history"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex
              items-center
              gap-3
              p-4
              rounded-xl
              text-slate-700 dark:text-white bg-slate-100 dark:bg-teal-950/70
              border-b
              border-slate-800
              hover:bg-teal-800
              transition
            "
          >
            <FaHistory />
            History
          </Link>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex
            items-center
            gap-3
            p-4
            border-t
            border-slate-700
            text-slate-700 dark:text-white
            rounded-xl
            hover:bg-red-500 hover:text-white
            transition
          "
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
