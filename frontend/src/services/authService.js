import axios from "axios";

// Backend API adresimiz
const API_URL = "http://localhost:5000/api";

export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });

  return response.data; // token ve user bilgilerini döndürür
};
