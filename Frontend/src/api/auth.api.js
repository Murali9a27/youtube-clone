import axiosInstance from "./axios";

export const loginUser = (data) => {
  return axiosInstance.post("/users/login", data);
};

export const registerUser = (data) => {
  return axiosInstance.post("/users/register", data);
};
