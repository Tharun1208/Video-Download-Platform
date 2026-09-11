import {
  MonitorUp,
  X,
} from "lucide-react";

function ScreenShare({
  active,
  onStop,
}) {
  if (!active) {
    return null;
  }

  return (
    <div className="relative bg-[#07111F] border border-[#38BDF8]/40 rounded-xl p-5 sm:p-8">

      <div className="aspect-video flex flex-col items-center justify-center text-center">

        <div className="w-16 h-16 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">

          <MonitorUp size={32} />

        </div>

        <h3 className="font-bold text-lg mt-4">
          Screen Sharing Active
        </h3>

        <p className="text-[#64748B] text-sm mt-1">
          Your screen is being shared with
          participants.
        </p>

      </div>

      <button
        onClick={onStop}
        className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center"
      >
        <X size={17} />
      </button>

    </div>
  );
}

export default ScreenShare;