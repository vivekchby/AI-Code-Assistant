import {
  FaBars,
  FaUserCircle,
} from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = ({
  setSidebarOpen,
}) => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white dark:bg-indigo-600 px-4 md:px-8 py-4 flex justify-between items-center text-slate-800 dark:text-white shadow-sm">
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
        <Link to="/profile" className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-indigo-500 transition" title="Manage profile">
          <FaUserCircle
            size={36}
            className="text-slate-400 dark:text-indigo-200"
          />

          <div className="hidden md:block">
            <p className="font-semibold">
              {user?.name}
            </p>
            <p className="text-sm text-slate-400 dark:text-indigo-100">
              Developer
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
