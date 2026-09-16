import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/transactions`;

export const getTransactions = async (params = {}) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(API_URL, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const exportTransactions = async (params = {}) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/export`, { params, headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
};

export const getCustomerTransactionHistory = async (customerId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/customer/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await axios.patch(`${API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const deleteTransaction = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};
