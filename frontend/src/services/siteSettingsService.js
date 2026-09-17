import axios from "axios";
import { API_URL } from "../config/api";

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
