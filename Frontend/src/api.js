import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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

  const response = await API.get(value, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(response.data);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

export const authAPI = {
  login: (data) => API.post("/users/login", data),
  register: (data) => API.post("/users/register", data),
  getCurrentUser: () => API.get("/users/me"),
  logout: () => API.post("/users/logout"),
};

export default API;
