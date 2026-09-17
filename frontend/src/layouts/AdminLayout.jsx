import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route değiştiğinde mobil menüyü otomatik kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/ilanlar", label: "İlanlar", icon: "🏡" },
    { to: "/admin/musteriler", label: "Müşteriler", icon: "👥" },
    { to: "/admin/iletisim-talepleri", label: "İletişim Talepleri", icon: "📩" },
    { to: "/admin/islem-gecmisi", label: "İşlem Geçmişi", icon: "📜" },
    { to: "/admin/site-ayarlari", label: "Site Ayarları", icon: "⚙️" },
    { to: "/admin/hesap", label: "Hesap Ayarları", icon: "👤" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-novis-cream">
      {/* =====================================================
          MOBİL ADMIN ÜST NAVBAR (md altı ekranlar)
      ====================================================== */}
      <header className="sticky top-0 z-50 bg-novis-anthracite border-b border-novis-bronze/20 px-4 py-3.5 flex items-center justify-between md:hidden shadow-md">
        <Link to="/admin" className="flex items-center gap-2 select-none">
          <span className="font-display text-xl font-bold text-novis-gold">
            NOVIS
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-novis-gold/20 text-novis-gold px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>

        {/* Hamburger Menü Butonu */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-novis-bronze/40 bg-white/5 text-novis-cream transition hover:border-novis-gold hover:text-novis-gold cursor-pointer"
        >
          {isMobileMenuOpen ? (
            /* X Kapat İkonu */
            <svg
              className="h-5 w-5 text-novis-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            /* Hamburger İkonu */
            <svg
              className="h-5 w-5 text-novis-cream"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </header>

      {/* MOBİL MENÜ AÇILIR PANEL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-40 bg-black/50 backdrop-blur-xs md:hidden">
          <div className="bg-[#161616] border-b border-novis-bronze/30 p-4 max-h-[calc(100vh-57px)] overflow-y-auto shadow-2xl space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-novis-gold text-novis-anthracite font-bold shadow-xs"
                      : "text-novis-cream hover:bg-white/10 hover:text-novis-gold"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-800 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-novis-gold hover:bg-white/10 transition"
              >
                <span>🌐</span>
                <span>← Siteye Dön</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition cursor-pointer text-left"
              >
                <span>🚪</span>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MASAÜSTÜ SOL MENÜ (Sidebar - md ve üzeri ekranlar)
      ====================================================== */}
      <aside className="hidden w-64 bg-novis-anthracite p-6 text-novis-cream md:block shrink-0 min-h-screen sticky top-0">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-novis-gold">
            NOVIS
          </h1>
          <p className="text-xs text-gray-400 tracking-wider font-semibold mt-0.5">
            ADMIN PANEL
          </p>
        </div>

        <nav className="space-y-1.5 text-sm">
          {navLinks.map((link) => {
            const isActive =
              link.to === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition ${
                  isActive
                    ? "bg-novis-gold text-novis-anthracite font-bold shadow-xs"
                    : "text-novis-cream hover:bg-novis-brown"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-gray-800 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-novis-gold hover:bg-novis-brown transition font-medium"
            >
              <span>🌐</span>
              <span>← Siteye Dön</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium cursor-pointer text-left"
            >
              <span>🚪</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* =====================================================
          SAĞ ANA İÇERİK ALANI
      ====================================================== */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
