import API from "./axios";

// Download a video
export const downloadVideo = (videoId) => {
  return API.post(`/downloads/${videoId}`);
};

// Get download history
export const getDownloadHistory = () => {
  return API.get("/downloads/history");
};