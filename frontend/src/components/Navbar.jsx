import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "./ui/Container";
import Button from "./ui/Button";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Route değiştiğinde menüyü otomatik kapat
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="relative z-50 border-b border-novis-bronze/20 bg-novis-anthracite">
      <Container>
        <nav className="flex h-20 items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center select-none">
            <span className="font-display text-xl sm:text-2xl font-bold text-novis-gold">
              NOVIS
            </span>
            <span className="ml-2 text-xs sm:text-sm tracking-wide text-novis-cream">
              GAYRİMENKUL
            </span>
          </Link>

          {/* MASAÜSTÜ MENÜ (md ve üzeri) */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="text-novis-cream transition hover:text-novis-gold text-sm font-medium"
            >
              Ana Sayfa
            </Link>

            <Link
              to="/ilanlar"
              className="text-novis-cream transition hover:text-novis-gold text-sm font-medium"
            >
              İlanlar
            </Link>

            <Link
              to="/hakkimizda"
              className="text-novis-cream transition hover:text-novis-gold text-sm font-medium"
            >
              Hakkımızda
            </Link>

            <Link
              to="/iletisim"
              className="text-novis-cream transition hover:text-novis-gold text-sm font-medium"
            >
              İletişim
            </Link>

            <Link to="/ilanlar">
              <Button size="sm">İlanlara Bak</Button>
            </Link>
          </div>

          {/* MOBİL HAMBURGER BUTONU (md altı) */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={isOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-novis-bronze/40 bg-white/5 text-novis-cream transition hover:border-novis-gold hover:text-novis-gold focus:outline-none md:hidden cursor-pointer active:scale-95"
          >
            {isOpen ? (
              /* Kapat (X) İkonu */
              <svg
                className="h-6 w-6 text-novis-gold"
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
              /* Hamburger (☰) İkonu */
              <svg
                className="h-6 w-6 text-novis-cream"
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
        </nav>
      </Container>

      {/* MOBİL AÇILIR MENÜ PANELİ */}
      {isOpen && (
        <div className="border-t border-novis-bronze/30 bg-[#161616] md:hidden shadow-2xl transition-all duration-200">
          <Container className="py-4">
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center min-h-[46px] rounded-xl px-4 text-base font-medium text-novis-cream transition hover:bg-white/10 hover:text-novis-gold active:bg-white/15"
              >
                Ana Sayfa
              </Link>

              <Link
                to="/ilanlar"
                onClick={() => setIsOpen(false)}
                className="flex items-center min-h-[46px] rounded-xl px-4 text-base font-medium text-novis-cream transition hover:bg-white/10 hover:text-novis-gold active:bg-white/15"
              >
                İlanlar
              </Link>

              <Link
                to="/hakkimizda"
                onClick={() => setIsOpen(false)}
                className="flex items-center min-h-[46px] rounded-xl px-4 text-base font-medium text-novis-cream transition hover:bg-white/10 hover:text-novis-gold active:bg-white/15"
              >
                Hakkımızda
              </Link>

              <Link
                to="/iletisim"
                onClick={() => setIsOpen(false)}
                className="flex items-center min-h-[46px] rounded-xl px-4 text-base font-medium text-novis-cream transition hover:bg-white/10 hover:text-novis-gold active:bg-white/15"
              >
                İletişim
              </Link>

              <div className="pt-3 pb-1">
                <Link to="/ilanlar" onClick={() => setIsOpen(false)}>
                  <Button className="w-full justify-center py-3.5 text-base shadow-md font-semibold">
                    İlanlara Bak
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

export default Navbar;
