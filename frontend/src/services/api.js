import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const submitQuestion = (data) => API.post("/questions", data);
export const getHistory = (params) => API.get("/questions/history", { params });
