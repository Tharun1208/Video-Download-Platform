import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Clapperboard,
  Lock,
  Globe,
  ArrowLeft,
  PlusCircle,
  LoaderCircle,
  PlaySquare,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

function CreateParty() {
  const navigate = useNavigate();
  const { videoId } = useParams();

  const [roomName, setRoomName] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CREATE ROOM
  // ==========================================

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }

    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube video URL");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const API_URL = import.meta.env.VITE_API_URL;

      console.log("=================================");
      console.log("CREATING WATCH PARTY");
      console.log("API URL:", API_URL);
      console.log(
        "REQUEST:",
        `${API_URL}/api/rooms`
      );
      console.log(
        "TOKEN:",
        token ? "Exists" : "Missing"
      );
      console.log("ROOM NAME:", roomName);
      console.log("YOUTUBE URL:", youtubeUrl);
      console.log("PRIVACY:", privacy);
      console.log("=================================");

      const response = await fetch(
        `${API_URL}/api/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomName: roomName.trim(),
            youtubeUrl: youtubeUrl.trim(),
            privacy,
            videoId: videoId || null,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CREATE ROOM RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create watch party"
        );
      }

      if (!data.room) {
        throw new Error(
          "Room was created but no room data was returned"
        );
      }

      console.log("=================================");
      console.log(
        "WATCH PARTY CREATED"
      );
      console.log(
        "ROOM CODE:",
        data.room.roomCode
      );
      console.log("ROOM:", data.room);
      console.log("=================================");

      toast.success(
        "Watch Party created successfully!"
      );

      navigate(
        `/watch-party/room/${data.room.roomCode}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Create Party Error:",
        error
      );

      toast.error(
        error.message ||
          "Failed to create watch party"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        transition-colors
        duration-500
      "
    >
      <Navbar />

      <main
        className="
          w-full
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-8
          sm:py-10
          lg:py-14
        "
      >
        {/* HEADER */}
        <div
          className="
            max-w-3xl
            mx-auto
            text-center
            mb-8
            sm:mb-10
          "
        >
          <div
            className="
              w-16
              h-16
              sm:w-20
              sm:h-20
              mx-auto
              mb-5
              flex
              items-center
              justify-center
              rounded-2xl
              sm:rounded-3xl
              bg-blue-500/10
              border
              border-blue-500/30
              text-blue-500
              shadow-lg
            "
          >
            <Clapperboard
              size={34}
              strokeWidth={1.7}
            />
          </div>

          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              font-extrabold
              theme-text
            "
          >
            Create Watch Party
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              md:text-lg
              theme-text-secondary
              mt-3
              leading-relaxed
            "
          >
            Watch your favorite videos together
            with friends in real time.
          </p>
        </div>

        {/* FORM */}
        <div className="max-w-3xl mx-auto">
          <div
            className="
              relative
              overflow-hidden
              theme-card
              theme-border
              border
              rounded-2xl
              sm:rounded-3xl
              p-5
              sm:p-7
              md:p-9
              shadow-2xl
              transition-colors
              duration-500
            "
          >
            <div
              className="
                absolute
                -top-24
                -right-24
                w-56
                h-56
                bg-blue-500/10
                rounded-full
                blur-3xl
                pointer-events-none
              "
            />

            <form
              onSubmit={handleCreateRoom}
              className="
                relative
                space-y-5
                sm:space-y-6
              "
            >
              {/* ROOM NAME */}
              <div>
                <label
                  className="
                    flex
                    items-center
                    gap-2
                    mb-2
                    text-sm
                    sm:text-base
                    font-semibold
                    theme-text-secondary
                  "
                >
                  <Clapperboard
                    size={17}
                    className="text-blue-500"
                  />
                  Room Name
                </label>

                <input
                  type="text"
                  value={roomName}
                  onChange={(e) =>
                    setRoomName(e.target.value)
                  }
                  placeholder="Example: Movie Night"
                  className="
                    w-full
                    p-3.5
                    sm:p-4
                    rounded-xl
                    theme-input
                    theme-text
                    theme-border
                    border
                    outline-none
                    transition-all
                    duration-300
                    hover:border-blue-500
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    placeholder:text-gray-400
                  "
                />
              </div>

              {/* VIDEO URL */}
              <div>
                <label
                  className="
                    flex
                    items-center
                    gap-2
                    mb-2
                    text-sm
                    sm:text-base
                    font-semibold
                    theme-text-secondary
                  "
                >
                  <PlaySquare
                    size={18}
                    className="text-red-500"
                  />
                  Video URL
                </label>

                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) =>
                    setYoutubeUrl(e.target.value)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="
                    w-full
                    p-3.5
                    sm:p-4
                    rounded-xl
                    theme-input
                    theme-text
                    theme-border
                    border
                    outline-none
                    transition-all
                    duration-300
                    hover:border-blue-500
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    placeholder:text-gray-400
                  "
                />

                <p
                  className="
                    text-xs
                    sm:text-sm
                    theme-text-muted
                    mt-2
                  "
                >
                  Enter a valid YouTube video URL.
                </p>
              </div>

              {/* PRIVACY */}
              <div>
                <label
                  className="
                    flex
                    items-center
                    gap-2
                    mb-2
                    text-sm
                    sm:text-base
                    font-semibold
                    theme-text-secondary
                  "
                >
                  {privacy === "Public" ? (
                    <Globe
                      size={17}
                      className="text-blue-500"
                    />
                  ) : (
                    <Lock
                      size={17}
                      className="text-blue-500"
                    />
                  )}

                  Privacy
                </label>

                <select
                  value={privacy}
                  onChange={(e) =>
                    setPrivacy(e.target.value)
                  }
                  className="
                    w-full
                    p-3.5
                    sm:p-4
                    rounded-xl
                    theme-input
                    theme-text
                    theme-border
                    border
                    outline-none
                    cursor-pointer
                    transition-all
                    duration-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    dark:[color-scheme:dark] [color-scheme:light]
                  "
                >
                  <option value="Public" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                    Public
                  </option>

                  <option value="Private" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                    Private
                  </option>
                </select>

                <div
                  className="
                    mt-3
                    flex
                    items-start
                    gap-2
                    text-xs
                    sm:text-sm
                    theme-text-muted
                  "
                >
                  {privacy === "Public" ? (
                    <>
                      <Globe
                        size={15}
                        className="
                          text-blue-500
                          shrink-0
                        "
                      />

                      <span>
                        Anyone with the room code
                        can join your party.
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock
                        size={15}
                        className="
                          text-blue-500
                          shrink-0
                        "
                      />

                      <span>
                        Only invited users can
                        access your party.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* CREATE BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-gradient-to-r
                  from-blue-600
                  to-sky-500
                  py-3.5
                  sm:py-4
                  rounded-xl
                  text-base
                  sm:text-lg
                  font-bold
                  text-white
                  shadow-lg
                  transition-all
                  duration-300
                  hover:scale-[1.01]
                  hover:shadow-blue-500/20
                  active:scale-[0.98]
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={21}
                      className="animate-spin"
                    />
                    Creating Party...
                  </>
                ) : (
                  <>
                    <PlusCircle size={21} />
                    Create Watch Party
                  </>
                )}
              </button>
            </form>

            {/* BACK */}
            <div
              className="
                mt-6
                pt-5
                theme-border
                border-t
              "
            >
              <Link
                to="/dashboard"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  sm:text-base
                  text-blue-500
                  hover:text-blue-400
                  transition
                "
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateParty;