import {
  Crown,
  Circle,
} from "lucide-react";

function ParticipantList({
  participants = [],
  hostId,
}) {
  return (
    <div className="p-4 sm:p-5">

      {/* EMPTY */}

      {participants.length === 0 ? (

        <div className="py-8 text-center theme-text-muted">
          No participants
        </div>

      ) : (

        <div className="space-y-3">

          {participants.map((user, index) => {

            const participantId =
              user?.userId ||
              user?._id ||
              user?.id;

            const isHost =
              String(participantId) === String(hostId) ||
              user?.isHost;

            const participantName =
              user?.name ||
              user?.userName ||
              "User";

            return (
              <div
                key={
                  participantId ||
                  `${participantName}-${index}`
                }
                className="
                  theme-card
                  border
                  theme-border
                  rounded-xl
                  p-3
                  flex
                  items-center
                  justify-between
                  gap-3
                  transition-all
                  duration-300
                  hover:border-blue-400/50
                  hover:-translate-y-0.5
                "
              >

                {/* USER */}

                <div className="flex items-center gap-3 min-w-0">

                  {/* AVATAR */}

                  <div
                    className="
                      w-10
                      h-10
                      shrink-0
                      rounded-full
                      bg-gradient-to-br
                      from-blue-600
                      to-sky-500
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-white
                    "
                  >
                    {participantName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* NAME + STATUS */}

                  <div className="min-w-0">

                    <p className="font-semibold truncate">
                      {participantName}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-green-500">

                      <Circle
                        size={7}
                        fill="currentColor"
                      />

                      <span>
                        Online
                      </span>

                    </div>

                  </div>

                </div>

                {/* HOST */}

                {isHost && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1
                      text-yellow-500
                      text-xs
                      font-semibold
                      shrink-0
                    "
                  >

                    <Crown size={15} />

                    <span className="hidden sm:inline">
                      Host
                    </span>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default ParticipantList;