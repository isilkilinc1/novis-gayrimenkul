import axios from "axios";
import { API_URL } from "../config/api";

const TRANSACTIONS_API_URL = `${API_URL}/transactions`;

export const getTransactions = async (params = {}) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(TRANSACTIONS_API_URL, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const exportTransactions = async (params = {}) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${TRANSACTIONS_API_URL}/export`, { params, headers: { Authorization: `Bearer ${token}` } });
  return response.data.data;
};

export const getCustomerTransactionHistory = async (customerId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${TRANSACTIONS_API_URL}/customer/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await axios.patch(`${TRANSACTIONS_API_URL}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};

export const deleteTransaction = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${TRANSACTIONS_API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
};
