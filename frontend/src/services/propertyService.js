import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Tüm ilanları backend'den çeken fonksiyon
export const getProperties = async () => {
  const response = await axios.get(`${API_URL}/properties`);
  return response.data;
};

// ID'ye göre tek ilanı backend'den çeken fonksiyon
export const getPropertyById = async (id) => {
  const response = await axios.get(`${API_URL}/properties/${id}`);
  return response.data;
};

// İlanı silen fonksiyon
export const deleteProperty = async (id) => {
  const token = localStorage.getItem("token"); // Admin token'ı
  const response = await axios.delete(`${API_URL}/properties/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Yeni ilan oluşturan fonksiyon
export const createProperty = async (propertyData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/properties`, propertyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// İlanı güncelleyen fonksiyon (YENİ EKLEDİK)
export const updateProperty = async (id, propertyData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/properties/${id}`,
    propertyData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
