import React from "react";
import { Crown } from "lucide-react";

function PlanBadge({ plan = "Free" }) {
  const isPremium = plan === "Premium";

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold
      ${
        isPremium
          ? "bg-yellow-500 text-black"
          : "bg-gray-800 text-gray-300 border border-gray-700"
      }`}
    >
      {isPremium && <Crown size={18} />}
      {plan}
    </span>
  );
}

export default PlanBadge;