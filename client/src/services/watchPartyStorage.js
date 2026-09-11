const STORAGE_KEY = "watchParties";

export const getWatchParties = () => {
  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    ) || {};
  } catch {
    return {};
  }
};

export const saveWatchParty = (party) => {
  const parties = getWatchParties();

  parties[party.roomCode] = party;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(parties)
  );

  return party;
};

export const getWatchParty = (roomCode) => {
  const parties = getWatchParties();

  return parties[roomCode] || null;
};

export const deleteWatchParty = (roomCode) => {
  const parties = getWatchParties();

  delete parties[roomCode];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(parties)
  );
};

export const generateRoomCode = () => {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
};