import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  LayoutDashboard,
  PlaySquare,
  Download,
  User,
  Crown,
  Settings,
  LogOut,
  Menu as MenuIcon,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Button from "../common/Button";
import ConfirmationModal from "../common/ConfirmationModal";
import Logo from "../common/Logo";

// =========================================================
// SIDEBAR MENU ITEMS
// =========================================================

const menuItems = [
  {
    name: "Home",
    path: "/",
    icon: House,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Browse Videos",
    path: "/videos",
    icon: PlaySquare,
  },
  {
    name: "Downloads",
    path: "/downloads",
    icon: Download,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    name: "Subscription",
    path: "/subscription",
    icon: Crown,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

// =========================================================
// SIDEBAR
// =========================================================

function Sidebar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingLoginEmail");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <motion.aside
      animate={{ width: expanded ? 256 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex min-h-screen flex-shrink-0 theme-bg theme-border theme-text border-r flex-col p-4 z-30 select-none"
    >
      {/* HEADER */}
      <div
        className={`flex items-center mb-8 h-12 ${
          expanded ? "justify-between" : "justify-center"
        }`}
      >
        <AnimatePresence>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <Logo asLink={true} size="sm" withText={true} />
            </motion.div>
          ) : (
            <Logo asLink={true} size="sm" withText={false} />
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-10 h-10 flex items-center justify-center rounded-2xl theme-bg-secondary theme-border border theme-text-secondary hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors shadow-sm cursor-pointer"
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft size={18} /> : <MenuIcon size={18} />}
        </motion.button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center rounded-2xl font-medium transition-all duration-200 ${
                  expanded
                    ? "gap-3.5 px-4 py-3"
                    : "justify-center px-0 py-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 font-semibold"
                    : "theme-text-secondary hover:bg-blue-500/10 hover:text-blue-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-white" : ""
                    }`}
                  />

                  {expanded && (
                    <span className="whitespace-nowrap text-sm tracking-wide">
                      {item.name}
                    </span>
                  )}

                  {!expanded && (
                    <span className="absolute left-16 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl theme-card theme-border border theme-text text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="pt-4 theme-border border-t">
        {expanded ? (
          <Button
            variant="danger"
            fullWidth
            icon={<LogOut size={16} />}
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </Button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="group relative w-full h-11 flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-xl theme-card theme-border border theme-text text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
              Logout
            </span>
          </motion.button>
        )}
      </div>

      {/* WhatsApp-Style Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log out of StreamVault?"
        message="Are you sure you want to log out of your account on this device?"
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </motion.aside>
  );
}

export default Sidebar;