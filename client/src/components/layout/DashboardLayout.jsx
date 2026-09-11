import React from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function DashboardLayout() {
  const location = useLocation();

  return (
    <div
      className="
        flex
        min-h-screen
        theme-bg
        theme-text
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className="
          flex-1
          min-w-0
          flex
          flex-col
          theme-bg
          transition-colors
          duration-300
        "
      >
        {/* =================================================
            NAVBAR
        ================================================= */}

        <Navbar />

        {/* =================================================
            PAGE CONTENT WITH ANIMATED TRANSITIONS
        ================================================= */}

        <main
          className="
            flex-1
            min-w-0
            theme-bg
            theme-text
            p-4
            sm:p-6
            transition-colors
            duration-300
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;