import { Link } from "react-router-dom";
import Container from "../../components/ui/Container";

function NotFound() {
  return (
    <section className="py-20 sm:py-28 min-h-[70vh] flex items-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-novis-gold/10 text-novis-bronze font-bold text-4xl mb-6 shadow-inner">
            404
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
            SAYFA BULUNAMADI
          </p>

          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-novis-anthracite">
            Aradığınız Sayfaya Ulaşılamadı
          </h1>

          <p className="mt-4 text-base sm:text-lg text-novis-brown max-w-lg mx-auto leading-relaxed">
            Gitmek istediğiniz sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanım dışı kalmış olabilir.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-novis-gold text-novis-anthracite hover:bg-novis-bronze hover:text-novis-cream transition-colors duration-200"
            >
              ← Ana Sayfaya Dön
            </Link>
            <Link
              to="/ilanlar"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold border border-novis-gold text-novis-bronze hover:bg-novis-gold/10 transition-colors duration-200"
            >
              İlanları İncele
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default NotFound;
