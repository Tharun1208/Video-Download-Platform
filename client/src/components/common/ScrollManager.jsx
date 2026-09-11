import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollManager() {
  const { pathname } = useLocation();
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  // Reveal Back-to-Top button when scrolled past 350px
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* FLOATING BACK-TO-TOP BUTTON */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={scrollToTop}
            title="Scroll to top"
            aria-label="Scroll to top"
            className="fixed bottom-6 right-6 z-[9998] flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/90 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/35 backdrop-blur-md border border-white/20 transition-colors cursor-pointer group"
          >
            <ArrowUp
              size={20}
              className="transition-transform group-hover:-translate-y-0.5"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
