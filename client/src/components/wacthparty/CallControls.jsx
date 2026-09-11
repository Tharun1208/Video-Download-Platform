import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
} from "lucide-react";

function CallControls({
  muted,
  cameraOff,
  screenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreen,
  onLeave,
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* MIC */}
      <button
        onClick={onToggleMute}
        title={muted ? "Unmute" : "Mute"}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
          muted
            ? "bg-red-600 hover:bg-red-700"
            : "theme-card hover:border-blue-500"
        }`}
      >
        {muted ? (
          <MicOff size={19} />
        ) : (
          <Mic size={19} />
        )}
      </button>

      {/* CAMERA */}
      <button
        onClick={onToggleCamera}
        title={
          cameraOff
            ? "Turn camera on"
            : "Turn camera off"
        }
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
          cameraOff
            ? "bg-red-600 hover:bg-red-700"
            : "theme-card hover:border-blue-500"
        }`}
      >
        {cameraOff ? (
          <VideoOff size={19} />
        ) : (
          <Video size={19} />
        )}
      </button>

      {/* SCREEN SHARE */}
      <button
        onClick={onToggleScreen}
        title={
          screenSharing
            ? "Stop sharing"
            : "Share screen"
        }
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition ${
          screenSharing
            ? "bg-[#0EA5E9] hover:bg-[#0284C7]"
            : "theme-card hover:border-blue-500"
        }`}
      >
        <MonitorUp size={19} />
      </button>

      {/* LEAVE */}
      <button
        onClick={onLeave}
        title="Leave call"
        className="
          w-11
          h-11
          sm:w-12
          sm:h-12
          rounded-full
          bg-red-600
          hover:bg-red-700
          flex
          items-center
          justify-center
          transition
        "
      >
        <PhoneOff size={19} />
      </button>
    </div>
  );
}

export default CallControls;