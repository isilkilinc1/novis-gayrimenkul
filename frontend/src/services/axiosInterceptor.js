import axios from "axios";

/**
 * Sets up global Axios response interceptors.
 * If any API call returns 401 Unauthorized, it clears stored authentication
 * data and redirects the user to the admin login page.
 */
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Clear auth tokens
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Avoid infinite loop if already on login page
        if (!window.location.pathname.startsWith("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
      return Promise.reject(error);
    },
  );
};
