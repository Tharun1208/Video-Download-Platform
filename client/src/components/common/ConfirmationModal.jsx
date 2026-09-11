import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle, CheckCircle2, X, Loader2 } from "lucide-react";

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  type = "whatsapp", // 'whatsapp' | 'primary' | 'danger' | 'warning'
  icon: CustomIcon,
  loading = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, loading]);

  const typeConfig = {
    whatsapp: {
      iconBg: "bg-[#25D366]/15 text-[#25D366] dark:bg-[#25D366]/20 border border-[#25D366]/30",
      buttonBg: "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-[#25D366]/30",
      defaultIcon: CheckCircle2,
    },
    primary: {
      iconBg: "bg-blue-500/15 text-blue-500 dark:bg-blue-500/20 border border-blue-500/30",
      buttonBg: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30",
      defaultIcon: HelpCircle,
    },
    danger: {
      iconBg: "bg-red-500/15 text-red-500 dark:bg-red-500/20 border border-red-500/30",
      buttonBg: "bg-red-600 hover:bg-red-500 text-white shadow-red-500/30",
      defaultIcon: AlertTriangle,
    },
    warning: {
      iconBg: "bg-amber-500/15 text-amber-500 dark:bg-amber-500/20 border border-amber-500/30",
      buttonBg: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/30",
      defaultIcon: AlertTriangle,
    },
  };

  const currentType = typeConfig[type] || typeConfig.whatsapp;
  const IconComponent = CustomIcon || currentType.defaultIcon;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!loading) onClose();
            }}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
          />

          {/* WHATSAPP-STYLE MODAL POP-UP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border theme-border theme-card p-6 sm:p-7 shadow-2xl"
          >
            {/* CLOSE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onClose}
              disabled={loading}
              className="absolute right-4 top-4 rounded-full p-2 theme-text-muted hover:bg-gray-500/15 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </motion.button>

            {/* CONTENT */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${currentType.iconBg} shadow-sm`}
              >
                <IconComponent size={28} />
              </div>

              <h3 className="text-xl font-bold tracking-tight theme-text">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed theme-text-secondary max-w-xs">
                {message}
              </p>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex w-full flex-col-reverse sm:flex-row items-center gap-3">
                {showCancel && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="w-full sm:w-1/2 rounded-2xl border theme-border px-4 py-3 text-sm font-semibold theme-text-secondary hover:theme-text hover:bg-gray-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cancelText}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={`${showCancel ? "w-full sm:w-1/2" : "w-full"} flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-60 ${currentType.buttonBg}`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <span>{confirmText}</span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ConfirmationModal;
