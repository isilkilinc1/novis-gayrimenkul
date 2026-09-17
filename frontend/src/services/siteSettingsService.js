import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getSiteSettings = async () => {
  const response = await axios.get(`${API_URL}/site-settings`);
  return response.data.settings;
};

export const updateSiteSettings = async (settings) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(`${API_URL}/site-settings`, settings, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
