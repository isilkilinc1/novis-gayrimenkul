import { BACKEND_BASE_URL } from "../config/api";


export const getFullImageUrl = (url, fallback = "") => {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${BACKEND_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
