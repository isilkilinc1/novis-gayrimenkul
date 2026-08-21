import Container from "./ui/Container";
import Button from "./ui/Button";

function Navbar() {
  return (
    <header className="border-b border-novis-bronze/20 bg-novis-anthracite">
      <Container>
        <nav className="flex h-20 items-center justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-novis-gold">
              NOVIS
            </span>

            <span className="ml-2 text-sm text-novis-cream">GAYRİMENKUL</span>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              Ana Sayfa
            </a>

            <a
              href="#"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              İlanlar
            </a>

            <a
              href="#"
              className="text-novis-cream transition hover:text-novis-gold"
            >
              Hakkımızda
            </a>

            <Button size="sm">İletişim</Button>
          </div>
        </nav>
      </Container>
    </header>
  );
}

export default Navbar;
