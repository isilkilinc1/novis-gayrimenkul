import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-novis-cream flex flex-col justify-between">
      <div>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>

      <footer className="bg-novis-anthracite px-6 py-10 text-novis-cream mt-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-display text-xl text-novis-gold">
            NOVIS GAYRİMENKUL
          </p>

          <p className="mt-2 text-sm text-gray-300">
            ALIM - SATIM - KİRALAMA - İNŞAAT
          </p>

          <p className="mt-6 text-sm text-gray-400">
            © 2026 NOVIS Gayrimenkul. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
