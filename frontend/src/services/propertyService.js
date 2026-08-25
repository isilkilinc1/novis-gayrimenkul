import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Ziyaretçiler için: Sadece ACTIVE ilanları, arama, filtreleri ve pagination parametrelerini çeken fonksiyon
export const getProperties = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/properties`, {
    params: filters,
  });
  return response.data; // { data: [...], pagination: { page, limit, total, totalPages } } döner
};

// Adminler için: Tüm ilanları (ACTIVE, SOLD, INACTIVE vb.) çeken fonksiyon
export const getAdminProperties = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/properties/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ID'ye göre tek ilanı backend'den çeken fonksiyon
export const getPropertyById = async (id) => {
  const response = await axios.get(`${API_URL}/properties/${id}`);
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

// İlanı güncelleyen fonksiyon
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

// Sadece ilan durumunu (status) güncelleyen fonksiyon
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

// İlanı silen fonksiyon
export const deleteProperty = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}/properties/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ==========================================
// 📸 İLAN FOTOĞRAF SERVİSLERİ
// ==========================================

// 1. İlana ait fotoğrafları getir (Public)
export const getPropertyImages = async (propertyId) => {
  const response = await axios.get(
    `${API_URL}/properties/${propertyId}/images`,
  );
  return response.data.data;
};

// 2. Fotoğraf yükle (FormData ile çoklu yükleme - Admin yetkili)
export const uploadPropertyImages = async (propertyId, formData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.data;
};

// 3. Fotoğraf sil (Admin yetkili)
export const deletePropertyImage = async (propertyId, imageId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${API_URL}/properties/${propertyId}/images/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};

// 4. Kapak fotoğrafı yap (Admin yetkili)
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
  return response.data.data;
};
