import axios from "axios";

// ======================================================
// API BASE URL
// ======================================================

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5005";
const API_URL = BASE.endsWith("/api") ? BASE : `${BASE}/api`;

// ======================================================
// AXIOS INSTANCE
// ======================================================

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// AUTH TOKEN
// ======================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

// ======================================================
// GET COMMENTS
// GET /api/comments/:videoId
// ======================================================

export const getComments = (videoId) => {
  return api.get(
    `/comments/${videoId}`
  );
};

// ======================================================
// CREATE COMMENT
// POST /api/comments
// ======================================================

export const createComment = ({
  videoId,
  text,
  language = "auto",
}) => {
  return api.post(
    "/comments",
    {
      videoId,
      text,
      language,
    }
  );
};

// ======================================================
// LIKE COMMENT
// POST /api/comments/:commentId/like
// ======================================================

export const likeComment = (
  commentId
) => {
  return api.post(
    `/comments/${commentId}/like`
  );
};

// ======================================================
// DISLIKE COMMENT
// POST /api/comments/:commentId/dislike
// ======================================================

export const dislikeComment = (
  commentId
) => {
  return api.post(
    `/comments/${commentId}/dislike`
  );
};

// ======================================================
// REPORT COMMENT
// POST /api/comments/:commentId/report
// ======================================================

export const reportComment = (
  commentId,
  reason
) => {
  return api.post(
    `/comments/${commentId}/report`,
    {
      reason,
    }
  );
};

// ======================================================
// DELETE COMMENT
// DELETE /api/comments/:commentId
// ======================================================

export const deleteComment = (
  commentId
) => {
  return api.delete(
    `/comments/${commentId}`
  );
};

// ======================================================
// TRANSLATE COMMENT
// POST /api/translate
// ======================================================

export const translateComment = (
  text,
  targetLanguage
) => {
  return api.post(
    "/translate",
    {
      text,
      targetLanguage,
      sourceLanguage: "auto",
    }
  );
};

export default api;