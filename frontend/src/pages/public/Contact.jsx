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
              arayışlarınız için bizimle iletişime geçebilirsiniz.
            </p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Telefon */}
            <a
              href="tel:+905357665858"
              className="bg-white p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs transition hover:shadow-md hover:border-novis-bronze/40"
            >
              <div className="text-3xl mb-3">📞</div>

              <h3 className="font-bold text-novis-anthracite mb-1">Telefon</h3>

              <p className="text-sm text-novis-brown">0535 766 58 58</p>
            </a>

            {/* E-posta */}
            <a
              href="mailto:mehmetdmn_@hotmail.com"
              className="bg-white p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs transition hover:shadow-md hover:border-novis-bronze/40"
            >
              <div className="text-3xl mb-3">✉️</div>

              <h3 className="font-bold text-novis-anthracite mb-1">E-posta</h3>

              <p className="text-sm text-novis-brown break-all">
                mehmetdmn_@hotmail.com
              </p>
            </a>
          </div>

          {/* İletişim Formu */}
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}

export default Contact;
