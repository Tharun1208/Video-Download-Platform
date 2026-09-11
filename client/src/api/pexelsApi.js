import API from "./axios";

export const getPexelsVideos = (query) => {
  return API.get(`/pexels/${query}`);
};