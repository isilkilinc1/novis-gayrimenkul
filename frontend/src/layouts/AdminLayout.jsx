import { Link, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-novis-cream">
      {/* Sol Menü (Sidebar) */}
      <aside className="hidden w-64 bg-novis-anthracite p-6 text-novis-cream md:block">
        <div className="mb-10">
          <h1 className="font-display text-2xl font-bold text-novis-gold">
            NOVIS
          </h1>
          <p className="text-xs text-gray-400">ADMIN PANEL</p>
        </div>

        <nav className="space-y-2">
          <Link
            to="/admin"
            className="block rounded-lg px-4 py-3 hover:bg-novis-brown transition"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/ilanlar"
            className="block rounded-lg px-4 py-3 hover:bg-novis-brown transition"
          >
            İlanlar
          </Link>

          <Link
            to="/admin/musteriler"
            className="block rounded-lg px-4 py-3 hover:bg-novis-brown transition"
          >
            Müşteriler
          </Link>

          <Link
            to="/admin/talepler"
            className="block rounded-lg px-4 py-3 hover:bg-novis-brown transition"
          >
            Talepler
          </Link>

          <div className="pt-6 mt-6 border-t border-gray-800">
            <Link
              to="/"
              className="block rounded-lg px-4 py-3 text-novis-gold hover:bg-novis-brown transition"
            >
              ← Siteye Dön
            </Link>
          </div>
        </nav>
      </aside>

      {/* Sağ Ana İçerik Alanı */}
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
