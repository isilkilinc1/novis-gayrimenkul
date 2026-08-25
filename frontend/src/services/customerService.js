import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Tüm müşterileri getir (Admin token ile)
export const getCustomers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Yeni müşteri oluştur
export const createCustomer = async (customerData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/customers`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Müşteri güncelle
export const updateCustomer = async (id, customerData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/customers/${id}`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Müşteri sil
export const deleteCustomer = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
