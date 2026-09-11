import API from "./axios";

// Get User Profile
export const getProfile = () => {
  return API.get("/users/profile");
};

// Update Profile
export const updateProfile = (data) => {
  return API.put("/users/profile", data);
};

// Change Password
export const changePassword = (data) => {
  return API.put("/users/change-password", data);
};