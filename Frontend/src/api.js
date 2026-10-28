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
      } catch {}
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

export const encorianAPI = {
  submit: (data) => API.post('/encorians', data),
  getAll: (status) => API.get('/admin/encorians', { params: status ? { status } : {} }),
  getById: (id) => API.get(`/admin/encorians/${id}`),
  approve: (id) => API.patch(`/admin/encorians/${id}/approve`),
  reject: (id) => API.patch(`/admin/encorians/${id}/reject`),
  resendEmail: (id) => API.patch(`/admin/encorians/${id}/resend-email`),
  lookupTicket: (ticketCode) => API.get(`/admin/encorians/ticket/${encodeURIComponent(ticketCode)}`),
  checkIn: (ticketCode) => API.patch('/admin/encorians/check-in', { ticketCode }),
};

export const referralCodeAPI = {
  verify: (code) => API.get(`/encorians/verify-code/${encodeURIComponent(code)}`),
  getAll: () => API.get('/admin/referral-codes'),
  create: (data) => API.post('/admin/referral-codes', data),
  update: (id, data) => API.patch(`/admin/referral-codes/${id}`, data),
  delete: (id) => API.delete(`/admin/referral-codes/${id}`),
};

export const otsTicketAPI = {
  getAll: () => API.get('/admin/ots-tickets'),
  record: (data) => API.post('/admin/ots-tickets', data || {}),
  delete: (id) => API.delete(`/admin/ots-tickets/${id}`),
  updateSettings: (data) => API.patch('/admin/ots-tickets/settings', data),
};

export default API;
