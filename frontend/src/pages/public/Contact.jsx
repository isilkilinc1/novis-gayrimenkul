import Container from "../../components/ui/Container";
import ContactForm from "../../components/ContactForm";

function Contact() {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Başlık ve Açıklama */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-novis-anthracite mb-3">
              İletişim
            </h1>
            <p className="text-novis-brown max-w-xl mx-auto text-sm sm:text-base">
              Gayrimenkul yatırımlarınız, satılık veya kiralık daire
              arayışlarınız için uzman ekibimizle her zaman yanınızdayız.
            </p>
          </div>

          {/* İletişim Bilgileri Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-bold text-novis-anthracite mb-1">Adres</h3>
              <p className="text-sm text-novis-brown">Meram / Konya</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs">
              <div className="text-3xl mb-3">📞</div>
              <h3 className="font-bold text-novis-anthracite mb-1">Telefon</h3>
              <p className="text-sm text-novis-brown">0332 000 00 00</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs">
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="font-bold text-novis-anthracite mb-1">E-posta</h3>
              <p className="text-sm text-novis-brown">
                info@novisgayrimenkul.com
              </p>
            </div>
          </div>

          {/* Gerçek İletişim Formu (Backend ve Veritabanına Bağlı) */}
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

export default Contact;
