import API from "./axios";

// Get all videos
export const getAllVideos = (params = {}) => {
  return API.get("/videos", { params });
};

// Get single video by ID
export const getVideoById = (id) => {
  return API.get(`/videos/${id}`);
};

// Search videos
export const searchVideos = (query) => {
  return API.get(`/videos?search=${query}`);
};

// Filter videos by category
export const getVideosByCategory = (category) => {
  return API.get(`/videos?category=${category}`);
};