import {
  FaBars,
  FaUserCircle,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({
  setSidebarOpen,
}) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="bg-indigo-600 px-4 md:px-8 py-4 flex justify-between items-center text-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <FaBars size={22} />
        </button>

        <div>
          <h2 className="text-2xl font-bold">
            Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-indigo-500 transition"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === "light" ? (
            <FaMoon size={18} />
          ) : (
            <FaSun size={18} />
          )}
        </button>
        <Link to="/profile" className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-indigo-500 transition" title="Manage profile">
          <FaUserCircle
            size={36}
            className="text-indigo-200"
          />

          <div className="hidden md:block">
            <p className="font-semibold">
              {user?.name}
            </p>

            <p className="text-sm text-indigo-100">
              Developer
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
