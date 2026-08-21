import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/documents", label: "Documents" },
  { to: "/transactions", label: "Transactions" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/anomalies", label: "Anomalies" },
  { to: "/agent", label: "Agent" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 h-screen p-4">
      <h2 className="font-semibold text-slate-800 mb-6">
        ReconcileAI
      </h2>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}