import {
  Crown,
  Circle,
} from "lucide-react";

function ParticipantList({
  participants = [],
  hostId,
  currentUserId,
}) {
  // Deduplicate participants list by userId
  const uniqueParticipants = [];
  const seenIds = new Set();

  for (const user of participants) {
    const pId = String(user?.userId || user?._id || user?.id || "");
    if (pId && !seenIds.has(pId)) {
      seenIds.add(pId);
      uniqueParticipants.push(user);
    } else if (!pId) {
      uniqueParticipants.push(user);
    }
  }

  return (
    <div className="p-4 sm:p-5">

      {/* EMPTY */}

      {uniqueParticipants.length === 0 ? (

        <div className="py-8 text-center theme-text-muted">
          No participants
        </div>

      ) : (

        <div className="space-y-3">

          {uniqueParticipants.map((user, index) => {

            const participantId =
              user?.userId ||
              user?._id ||
              user?.id;

            const isHost =
              String(participantId) === String(hostId) ||
              user?.isHost;

            const isCurrentUser =
              currentUserId &&
              String(participantId) === String(currentUserId);

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

                    <p className="font-semibold truncate flex items-center gap-1.5">
                      <span>{participantName}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded-md">
                          You
                        </span>
                      )}
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