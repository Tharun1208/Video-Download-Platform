import API from "./axios";

export const getProfile = () => {
  return API.get("/users/profile");
};

export const updateProfile = (data) => {
  return API.put("/users/profile", data);
};