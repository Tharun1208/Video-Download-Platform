import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  ArrowLeft,
  LogIn,
  LoaderCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

function JoinParty() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    const code = roomCode.trim().toUpperCase();

    if (!code) {
      toast.error("Please enter a room code");
      return;
    }

    if (code.length !== 6) {
      toast.error("Room code must be 6 characters");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured");
      }

      const response = await fetch(
        `${API_URL}/api/rooms/${code}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Watch Party not found"
        );
      }

      if (!data.success || !data.room) {
        throw new Error("Watch Party not found");
      }

      toast.success("Watch Party found!");

      navigate(`/watch-party/room/${code}`);
    } catch (error) {
      console.error("Join Party Error:", error);

      toast.error(
        error.message || "Failed to join Watch Party"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg theme-text transition-colors duration-300">
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles size={15} />
              Watch together in real time
            </div>

            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users
                size={38}
                className="text-blue-500"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold">
              Join a{" "}
              <span className="text-blue-500">
                Watch Party
              </span>
            </h1>

            <p className="theme-text-secondary mt-4 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Enter the room code shared by your friend
              and start watching together.
            </p>
          </div>

          {/* CARD */}
          <div className="theme-card border theme-border rounded-3xl p-6 sm:p-9 shadow-2xl transition-colors duration-300">
            <form
              onSubmit={handleJoin}
              className="space-y-7"
            >
              {/* ROOM CODE */}
              <div>
                <label className="flex items-center justify-center gap-2 text-sm font-semibold theme-text-secondary mb-4">
                  <KeyRound
                    size={17}
                    className="text-blue-500"
                  />
                  Enter Room Code
                </label>

                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) =>
                    setRoomCode(
                      e.target.value
                        .toUpperCase()
                        .replace(/\s/g, "")
                    )
                  }
                  maxLength={6}
                  placeholder="ABC123"
                  autoComplete="off"
                  className="w-full h-20 rounded-2xl theme-input border theme-border theme-text text-center text-3xl sm:text-4xl font-extrabold tracking-[0.35em] uppercase outline-none transition-all duration-300 placeholder:theme-text-muted focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <p className="text-xs theme-text-muted mt-3 text-center">
                  Enter the 6-character room code
                </p>
              </div>

              {/* JOIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={21}
                      className="animate-spin"
                    />
                    Checking Room...
                  </>
                ) : (
                  <>
                    <LogIn size={21} />
                    Join Watch Party
                  </>
                )}
              </button>
            </form>

            {/* INFO */}
            <div className="mt-7 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <div className="flex items-start gap-3">
                <Users
                  size={18}
                  className="text-blue-500 mt-0.5 shrink-0"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Watching together
                  </p>

                  <p className="theme-text-secondary text-xs mt-1 leading-relaxed">
                    Once you join, you can watch the
                    video, chat with other participants
                    and stay synchronized in real time.
                  </p>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="border-t theme-border mt-7 pt-6">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition"
              >
                <ArrowLeft size={17} />
                Back to Dashboard
              </Link>
            </div>
          </div>

          <p className="text-center text-xs theme-text-muted mt-6">
            Invite your friends and enjoy your favorite
            videos together.
          </p>
        </div>
      </main>
    </div>
  );
}

export default JoinParty;