import axios from "axios";

// Backend API adresimiz
const API_URL = "http://localhost:5000/api";

// Admin giriş işlemi
export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });

  return response.data;
};

// Admin hesap bilgilerini güncelleme
export const updateAdminAccount = async ({
  currentPassword,
  newEmail,
  newPassword,
}) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/auth/account`,
    {
      currentPassword,
      newEmail,
      newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
