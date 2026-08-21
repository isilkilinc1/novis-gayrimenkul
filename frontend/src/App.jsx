import Navbar from "./components/Navbar";
import Container from "./components/ui/Container";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Badge from "./components/ui/Badge";
import Input from "./components/ui/Input";

function App() {
  return (
    <div className="min-h-screen bg-novis-cream">
      <Navbar />

      <main className="py-12">
        <Container>
          {/* Başlık */}
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold text-novis-anthracite">
              NOVIS Design System
            </h1>
            <p className="mt-2 text-novis-brown">
              Gün 2 - UI Bileşenleri ve Tasarım Sistemi Test Ekranı
            </p>
          </div>

          {/* Butonlar */}
          <section className="mb-12">
            <h2 className="mb-6 font-display text-2xl font-semibold text-novis-anthracite">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">İlanları İncele</Button>
              <Button variant="secondary">Detayları Gör</Button>
              <Button variant="dark">Admin Giriş</Button>
              <Button variant="ghost">İptal</Button>
            </div>
          </section>

          {/* Badges */}
          <section className="mb-12">
            <h2 className="mb-6 font-display text-2xl font-semibold text-novis-anthracite">
              Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <Badge variant="gold">SATILIK</Badge>
              <Badge variant="bronze">KİRALIK</Badge>
              <Badge variant="dark">AKTİF</Badge>
              <Badge variant="success">SATILDI</Badge>
              <Badge variant="danger">PASİF</Badge>
            </div>
          </section>

          {/* Inputs */}
          <section className="mb-12 max-w-xl">
            <h2 className="mb-6 font-display text-2xl font-semibold text-novis-anthracite">
              Inputs
            </h2>
            <div className="space-y-4">
              <Input
                label="İlan Başlığı"
                name="title"
                placeholder="Örn. 3+1 Lüks Daire"
              />
              <Input
                label="Fiyat (TL)"
                name="price"
                type="number"
                placeholder="3.250.000"
              />
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="mb-6 font-display text-2xl font-semibold text-novis-anthracite">
              Cards (Örnek İlan Kartı)
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <div className="h-48 bg-novis-brown flex items-center justify-center text-novis-cream font-display text-xl">
                  [ Gayrimenkul Fotoğrafı ]
                </div>
                <div className="p-6">
                  <Badge variant="gold">SATILIK</Badge>
                  <h3 className="mt-4 font-display text-2xl font-bold text-novis-anthracite">
                    3+1 Lüks Daire
                  </h3>
                  <p className="mt-2 text-novis-brown">Selçuklu / Konya</p>
                  <p className="mt-4 text-xl font-bold text-novis-gold">
                    3.250.000 TL
                  </p>
                  <div className="mt-6">
                    <Button variant="primary" className="w-full">
                      Detayları Gör
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}

export default App;
