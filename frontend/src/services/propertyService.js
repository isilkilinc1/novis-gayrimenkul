import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ======================================================
// PUBLIC - İLANLAR
// ======================================================

// Ziyaretçiler için aktif ilanları getir
export const getProperties = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/properties`, {
    params: filters,
  });

  return response.data;
};

// ID'ye göre ilan getir
export const getPropertyById = async (id) => {
  const response = await axios.get(`${API_URL}/properties/${id}`);

  return response.data;
};

// ======================================================
// ADMIN - İLANLAR
// ======================================================

// Admin için tüm ilanları getir
export const getAdminProperties = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/properties/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Yeni ilan oluştur
export const createProperty = async (propertyData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(`${API_URL}/properties`, propertyData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// İlanı güncelle
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

// İlan durumunu güncelle
export const updatePropertyStatus = async (id, status) => {
  const token = localStorage.getItem("token");

  const response = await axios.patch(
    `${API_URL}/properties/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// İlanı sil
export const deleteProperty = async (id) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(`${API_URL}/properties/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ======================================================
// İLAN FOTOĞRAFLARI
// ======================================================

// İlanın fotoğraflarını getir
export const getPropertyImages = async (propertyId) => {
  const response = await axios.get(
    `${API_URL}/properties/${propertyId}/images`,
  );

  return response.data;
};

// İlan fotoğraflarını yükle
export const uploadPropertyImages = async (propertyId, formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// İlan fotoğrafını sil
export const deletePropertyImage = async (imageId) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/properties/images/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

// ======================================================
// KAPAK FOTOĞRAFI
// ======================================================

// Fotoğrafı kapak fotoğrafı yap
export const setCoverImage = async (propertyId, imageId) => {
  const token = localStorage.getItem("token");

  const response = await axios.patch(
    `${API_URL}/properties/${propertyId}/images/${imageId}/cover`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
