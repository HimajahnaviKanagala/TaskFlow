import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/helpers";

const links = [
  { to: "/dashboard", icon: "▦", label: "Dashboard" },
  { to: "/projects", icon: "◫", label: "Projects" },
  { to: "/settings", icon: "⚙", label: "Settings" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email || "User";

  return (
    <aside
      className={`
    fixed md:static top-0 left-0 z-50 h-full w-56
    bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
    flex flex-col py-5 px-3 shrink-0
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
    >
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-7 h-7 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
            TF
          </span>
        </div>
        <span className="font-semibold text-gray-800 dark:text-white text-sm">
          TaskFlow
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              ${
                isActive
                  ? "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 px-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-700 text-xs font-semibold">
            {getInitials(name)}
          </span>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
          {name}
        </span>
      </div>
    </aside>
  );
}
