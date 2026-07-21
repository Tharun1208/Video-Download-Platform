import React from "react";
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
} from "lucide-react";

import Button from "../common/Button";

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

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-950 border-r border-gray-800 text-white flex flex-col p-5">

      {/* Logo */}

      <div className="mb-10 text-center cursor-pointer transition-all duration-300 hover:scale-105">

        <h1 className="text-3xl font-extrabold text-blue-500">
          VideoVault
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Download Platform
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white hover:translate-x-2"
                }`
              }
            >
              <Icon
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Logout */}

      <div className="pt-5">

        <Button
          variant="danger"
          fullWidth
          icon={<LogOut size={18} />}
          onClick={logout}
        >
          Logout
        </Button>

      </div>

    </aside>
  );
}

export default Sidebar;