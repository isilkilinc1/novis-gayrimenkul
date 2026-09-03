const API_URL = "http://localhost:5000/api";

export const getSiteSettings = async () => {
  const response = await fetch(`${API_URL}/site-settings`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Site ayarları alınamadı.");
  }

  return data.settings;
};

export const updateSiteSettings = async (settings) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/site-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Site ayarları güncellenemedi.");
  }

  return data;
};
