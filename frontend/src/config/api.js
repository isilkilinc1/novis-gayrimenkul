const RENDER_PROD_API = "https://novis-gayrimenkul.onrender.com/api";
const LOCAL_DEV_API = "http://localhost:5000/api";

// Engellenmesi gereken eski/geçersiz backend adresleri
const DEPRECATED_BACKENDS = [
  "https://novis-gayrimenkul-backend-2026.vercel.app",
  "https://novis-gayrimenkul-backend-2026.vercel.app/api",
];

const resolveApiUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();

  // Vercel dashboard'unda eski URL tanımlı kalmışsa bunu geçersiz kıl
  const isDeprecated =
    Boolean(envUrl) &&
    DEPRECATED_BACKENDS.some(
      (dep) => envUrl.replace(/\/$/, "") === dep.replace(/\/$/, "")
    );

  // Eğer geçerli ve eski olmayan özel bir ortam değişkeni verilmişse onu kullan
  if (envUrl && !isDeprecated) {
    return envUrl.replace(/\/$/, "");
  }

  // Production ortamında (Vite build) kesinlikle Render backend'ini kullan
  if (import.meta.env.PROD || import.meta.env.MODE === "production") {
    return RENDER_PROD_API;
  }

  // Development ortamında Localhost kullan
  return LOCAL_DEV_API;
};

export const API_URL = resolveApiUrl();
export const BACKEND_BASE_URL = API_URL.replace(/\/api\/?$/, "");
