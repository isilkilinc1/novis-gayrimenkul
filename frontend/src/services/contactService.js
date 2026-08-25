import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Ziyaretçi formu gönderir (Public)
export const sendContactRequest = async (formData) => {
  const response = await axios.post(`${API_URL}/contact-requests`, formData);
  return response.data;
};

// Admin tüm talepleri getirir
export const getContactRequests = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/contact-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Admin durum günceller
export const updateContactStatus = async (id, status) => {
  const token = localStorage.getItem("token");
  const response = await axios.patch(
    `${API_URL}/contact-requests/${id}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

// Admin talep siler
export const deleteContactRequest = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/contact-requests/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
