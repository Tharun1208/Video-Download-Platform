import React from "react";
import { Loader2 } from "lucide-react";

function Loader({ text = "Loading videos..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {/* Standard Default Circular Spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500" />

      {/* Default Loading Button */}
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 cursor-wait opacity-95 select-none"
      >
        <Loader2 size={16} className="animate-spin" />
        <span>{text}</span>
      </button>
    </div>
  );
}

export default Loader;