import React from "react";
import { Crown, Sparkles, Award, Shield } from "lucide-react";

function PlanBadge({ plan = "Free" }) {
  const planStyles = {
    Free: {
      className:
        "bg-gray-800 text-gray-300 border border-gray-700",
      icon: <Shield size={15} />,
    },

    Bronze: {
      className:
        "bg-orange-500/10 text-orange-400 border border-orange-500/30",
      icon: <Award size={15} />,
    },

    Silver: {
      className:
        "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      icon: <Sparkles size={15} />,
    },

    Gold: {
      className:
        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
      icon: <Crown size={15} />,
    },
  };

  const currentPlan = planStyles[plan] || planStyles.Free;

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        whitespace-nowrap
        transition-all
        duration-200
        hover:scale-105
        sm:px-4
        sm:py-2
        sm:text-sm
        ${currentPlan.className}
      `}
    >
      {currentPlan.icon}

      <span>{plan}</span>
    </span>
  );
}

export default PlanBadge;