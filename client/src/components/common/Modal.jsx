import React from "react";
import { X } from "lucide-react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-gray-800 p-5">

          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* Body */}

        <div className="p-6 text-gray-300">

          {children}

        </div>

        {/* Footer */}

        {footer && (

          <div className="border-t border-gray-800 p-5">

            {footer}

          </div>

        )}

      </div>

    </div>

  );

}

export default Modal;