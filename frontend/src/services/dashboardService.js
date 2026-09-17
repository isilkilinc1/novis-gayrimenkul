import axios from "axios";
import { API_URL } from "../config/api";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
