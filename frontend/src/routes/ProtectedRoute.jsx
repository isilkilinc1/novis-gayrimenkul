import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  // Tarayıcı hafızasında token var mı diye bakıyoruz
  const token = localStorage.getItem("token");

  // Eğer token yoksa, kullanıcıyı login sayfasına şutla
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Token varsa, gitmek istediği admin sayfasına (Outlet) izin ver
  return <Outlet />;
}

export default ProtectedRoute;
