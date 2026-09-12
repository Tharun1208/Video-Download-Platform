import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://video-download-platform.onrender.com";
const API_URL = `${BASE_URL}/api/notifications`;


// Get notifications
export const getNotifications = () => {
  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};


// Mark as read
export const markNotificationRead = (id) => {
  return axios.patch(
    `${API_URL}/${id}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};
// Mark all notifications as read
export const markAllNotificationsRead = () => {

  return axios.patch(
    `${API_URL}/read-all`,
    {},
    {
      headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

};

// Delete notification
export const deleteNotification = (id) => {
  return axios.delete(
    `${API_URL}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};