import { Link } from "react-router-dom";
import Container from "./ui/Container";
import Button from "./ui/Button";

function Navbar() {
  return (
    <header className="border-b border-novis-bronze/20 bg-novis-anthracite">
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="font-display text-2xl font-bold text-novis-gold">
              NOVIS
            </span>
            <span className="ml-2 text-sm text-novis-cream">GAYRİMENKUL</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              Ana Sayfa
            </Link>

            <Link
              to="/ilanlar"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              İlanlar
            </Link>

            <Link
              to="/hakkimizda"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              Hakkımızda
            </Link>

            <Link
              to="/iletisim"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              İletişim
            </Link>

            <Link to="/ilanlar">
              <Button size="sm">İlanlara Bak</Button>
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Navbar;
