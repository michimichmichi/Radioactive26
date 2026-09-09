import axios from "axios";
import { getApiErrorMessage } from "./utils/apiErrors";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data instanceof Blob && error.response.data.type.includes("json")) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch { /* Fall back to a status-specific message if the response is unreadable. */ }
    }
    error.userMessage = getApiErrorMessage(error);
    if (error.response?.status === 401 && error.config?.url !== "/users/login") {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
    }

    return Promise.reject(error);
  },
);

export const openProtectedFile = async (value) => {
  if (!value) return;
  if (/^https?:\/\//i.test(value)) {
    window.open(value, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const response = await API.get(value, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    window.alert(error.userMessage || "Unable to open the file. Please try again.");
  }
};

export const authAPI = {
  login: (data) => API.post("/users/login", data),
  register: (data) => API.post("/users/register", data),
  getCurrentUser: () => API.get("/users/me"),
  logout: () => API.post("/users/logout"),
};

export default API;
