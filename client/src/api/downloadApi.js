import API from "./axios";

// ==========================================
// DOWNLOAD VIDEO
// Supports MongoDB + Pexels
// ==========================================

export const downloadVideo = (videoId, data = {}) => {
  return API.post(
    `/downloads/${videoId}`,
    data
  );
};


// ==========================================
// GET DOWNLOAD HISTORY
// ==========================================

export const getDownloadHistory = () => {
  return API.get("/downloads/history");
};


// ==========================================
// DELETE DOWNLOAD
// ==========================================

export const deleteDownload = (downloadId) => {
  return API.delete(
    `/downloads/${downloadId}`
  );
};