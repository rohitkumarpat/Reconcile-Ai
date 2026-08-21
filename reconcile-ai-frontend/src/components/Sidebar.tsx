import { motion } from "framer-motion";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Repeat,
  AlertTriangle,
  Bot,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/documents",
    label: "Documents",
    icon: FileText,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: Receipt,
  },
  {
    to: "/subscriptions",
    label: "Subscriptions",
    icon: Repeat,
  },
  {
    to: "/anomalies",
    label: "Anomalies",
    icon: AlertTriangle,
  },
  {
    to: "/agent",
    label: "Agent",
    icon: Bot,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-border rounded-lg shadow-sm"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{
          width: collapsed ? 72 : 224,
        }}
        transition={{
          duration: 0.25,
          ease: "easeInOut",
        }}
        className="hidden md:flex flex-col bg-white border-r border-border h-screen sticky top-0 py-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 mb-6">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-semibold text-ink"
            >
              ReconcileAI
            </motion.span>
          )}

          <button
            onClick={() => setCollapsed((value) => !value)}
            className="text-muted hover:text-ink transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand font-medium"
                    : "text-muted hover:bg-slate-50 hover:text-ink"
                }`
              }
            >
              <Icon size={17} className="shrink-0" />

              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{
          x: mobileOpen ? 0 : "-100%",
        }}
        transition={{
          type: "tween",
          duration: 0.25,
        }}
        className="md:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-border z-50 py-4"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 mb-6">
          <span className="font-display font-semibold text-ink">
            ReconcileAI
          </span>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-muted hover:text-ink"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="space-y-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand font-medium"
                    : "text-muted hover:bg-slate-50 hover:text-ink"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}