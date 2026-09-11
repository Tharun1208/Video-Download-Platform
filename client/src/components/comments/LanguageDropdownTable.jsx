import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, Check, ChevronDown, X, Sparkles } from "lucide-react";

import { LANGUAGES_LIST, getLanguageObj } from "./languageData";

export default function LanguageDropdownTable({
  selected = "en",
  onSelect,
  includeAuto = false,
  label = "Language",
  size = "md",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus search input after mount
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 120);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const currentLang = getLanguageObj(selected);

  const filteredList = LANGUAGES_LIST.filter((item) => {
    if (category !== "all" && item.type !== category) return false;
    if (!search.trim()) return true;
    const query = search.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.native.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.badge.toLowerCase().includes(query)
    );
  });

  const handlePick = (code) => {
    onSelect(code);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger Button - Fully Responsive */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-between gap-1.5 sm:gap-2 rounded-xl border theme-border theme-card px-2.5 sm:px-3 transition-all duration-200 cursor-pointer shadow-xs hover:border-blue-500/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          size === "sm" ? "py-1.5 text-xs" : "py-2 text-xs font-medium"
        } ${isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : ""}`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Globe size={size === "sm" ? 12 : 13} />
          </div>
          {label && (
            <span className="hidden md:inline text-xs font-semibold theme-text-secondary">
              {label}:
            </span>
          )}
          <span className="font-bold theme-text truncate max-w-[80px] xs:max-w-[105px] sm:max-w-[130px] md:max-w-[150px]">
            {currentLang.name}
          </span>
          {currentLang.native && currentLang.native !== currentLang.name && (
            <span className="text-[11px] theme-text-muted hidden lg:inline truncate">
              ({currentLang.native})
            </span>
          )}
          <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
            {currentLang.badge}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`theme-text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </motion.button>

      {/* Screen-Aware Responsive Modal / Bottom Sheet via Portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[99999] flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
                {/* Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs"
                />

                {/* Modal Container: Bottom-Sheet on Mobile, Centered Card on Tablet & Desktop */}
                <motion.div
                  initial={{ y: "100%", opacity: 0.5, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: "100%", opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="relative z-10 w-full sm:max-w-lg md:max-w-xl rounded-t-3xl sm:rounded-2xl border-t sm:border theme-border theme-card bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
                >
                  {/* Mobile Drag Handle */}
                  <div className="block sm:hidden pt-2.5 pb-1">
                    <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300 dark:bg-zinc-700" />
                  </div>

                  {/* Header */}
                  <div className="p-3.5 sm:p-4 border-b theme-border bg-gray-50/80 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                          <Globe size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold theme-text leading-tight">
                            Select Language
                          </h3>
                          <p className="text-[11px] theme-text-muted">
                            Choose language to translate text
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl p-1.5 text-gray-400 hover:theme-text hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Close"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-2.5">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search language name or script (e.g. Kannada, ಕನ್ನಡ, Hindi)..."
                        className="w-full rounded-xl border theme-border theme-input py-2 pl-9 pr-8 text-xs sm:text-sm theme-text placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:theme-text p-1"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                      <button
                        type="button"
                        onClick={() => setCategory("all")}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          category === "all"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "theme-text-secondary hover:theme-text hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        All (${LANGUAGES_LIST.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("indian")}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          category === "indian"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "theme-text-secondary hover:theme-text hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        Indian Languages (11)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("global")}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          category === "global"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "theme-text-secondary hover:theme-text hover:bg-gray-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        Global Languages (10)
                      </button>
                    </div>
                  </div>

                  {/* Optional Auto / Any Language Banner */}
                  {includeAuto && (
                    <div
                      onClick={() => handlePick("auto")}
                      className={`flex items-center justify-between px-4 py-3 border-b theme-border cursor-pointer transition-colors ${
                        selected === "auto"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
                          : "hover:bg-blue-500/5 theme-text"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={16} className="text-amber-500 shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold">Auto (Detect Any Language)</p>
                          <p className="text-[11px] theme-text-muted">Automatically detect comment language</p>
                        </div>
                      </div>
                      {selected === "auto" ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
                          <Check size={14} />
                        </span>
                      ) : (
                        <span className="rounded-md border theme-border px-2 py-1 text-[11px] font-semibold text-gray-400">
                          Select
                        </span>
                      )}
                    </div>
                  )}

                  {/* Responsive Language Table List */}
                  <div className="flex-1 overflow-y-auto divide-y theme-border overscroll-contain">
                    {filteredList.length === 0 ? (
                      <div className="py-12 text-center text-xs sm:text-sm theme-text-muted">
                        No languages match "{search}".
                      </div>
                    ) : (
                      filteredList.map((item) => {
                        const isSelected = selected === item.code;
                        return (
                          <div
                            key={item.code}
                            onClick={() => handlePick(item.code)}
                            className={`flex items-center justify-between px-4 py-3 sm:py-3 transition-colors cursor-pointer active:scale-[0.99] ${
                              isSelected
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                : "hover:bg-blue-500/5 dark:hover:bg-blue-500/10 theme-text"
                            }`}
                          >
                            {/* Left Info: Name & Native Script */}
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold uppercase ${
                                  item.type === "indian"
                                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {item.badge}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-bold theme-text truncate">
                                    {item.name}
                                  </span>
                                  {item.type === "indian" && (
                                    <span className="rounded-md bg-orange-500/10 px-1.5 py-0.2 text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase hidden xs:inline">
                                      Indic
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-medium theme-text-secondary opacity-90 block truncate">
                                  {item.native}
                                </span>
                              </div>
                            </div>

                            {/* Right Info: Action / Selected check */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected ? (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                                  <Check size={14} />
                                </span>
                              ) : (
                                <span className="rounded-xl border theme-border px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:border-blue-500 transition">
                                  Pick
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t theme-border px-4 py-2.5 text-[11px] theme-text-muted bg-gray-50/70 dark:bg-zinc-800/30 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-500" />
                      <span>AI IndicTrans2 + Multi-Language Engine</span>
                    </span>
                    <span className="font-semibold">{filteredList.length} languages</span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
