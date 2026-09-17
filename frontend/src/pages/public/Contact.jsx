import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import ContactForm from "../../components/ContactForm";
import { getSiteSettings } from "../../services/siteSettingsService";

function Contact() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error("Site ayarları alınamadı:", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Başlık ve Açıklama */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-novis-anthracite mb-2 sm:mb-3">
              İletişim
            </h1>

            <p className="text-novis-brown max-w-xl mx-auto text-xs sm:text-base">
              Gayrimenkul yatırımlarınız, satılık veya kiralık daire
              arayışlarınız için bizimle iletişime geçebilirsiniz.
            </p>
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Telefon */}
            <a
              href={`tel:${(settings?.phone || "0535 766 58 58").replace(/\s/g, "")}`}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs transition hover:shadow-md hover:border-novis-bronze/40"
            >
              <div className="text-3xl mb-2 sm:mb-3">📞</div>

              <h3 className="font-bold text-novis-anthracite mb-1 text-base sm:text-lg">Telefon</h3>

              <p className="text-xs sm:text-sm text-novis-brown">
                {settings?.phone || "0535 766 58 58"}
              </p>
            </a>

            {/* E-posta */}
            <a
              href={`mailto:${settings?.email || "mehmetdmn_@hotmail.com"}`}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-novis-bronze/20 text-center shadow-xs transition hover:shadow-md hover:border-novis-bronze/40"
            >
              <div className="text-3xl mb-2 sm:mb-3">✉️</div>

              <h3 className="font-bold text-novis-anthracite mb-1 text-base sm:text-lg">E-posta</h3>

              <p className="text-xs sm:text-sm text-novis-brown break-all">
                {settings?.email || "mehmetdmn_@hotmail.com"}
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
