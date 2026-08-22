import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/public/Home";
import Properties from "../pages/public/Properties";
import PropertyDetail from "../pages/public/PropertyDetail";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import AdminProperties from "../pages/admin/Properties";
import CreateProperty from "../pages/admin/CreateProperty"; // <-- YENİ İTHALAT
import Customers from "../pages/admin/Customers";
import ContactRequests from "../pages/admin/ContactRequests";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC (Ziyaretçi) Sayfaları ve Layout'u */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ilanlar" element={<Properties />} />
          <Route path="/ilan/:id" element={<PropertyDetail />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/iletisim" element={<Contact />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<Login />} />

        {/* PROTECTED ADMIN PANEL */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/ilanlar" element={<AdminProperties />} />
            <Route
              path="/admin/ilanlar/yeni"
              element={<CreateProperty />}
            />{" "}
            {/* <-- YENİ ROTA */}
            <Route path="/admin/musteriler" element={<Customers />} />
            <Route path="/admin/talepler" element={<ContactRequests />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
