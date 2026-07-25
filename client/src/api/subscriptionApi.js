import API from "./axios";

export const upgradePlan = () => {
  return API.put("/subscription/upgrade");
};