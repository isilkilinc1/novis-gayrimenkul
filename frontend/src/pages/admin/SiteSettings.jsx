import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  getSiteSettings,
  updateSiteSettings,
} from "../../services/siteSettingsService";

function SiteSettings() {
  const [formData, setFormData] = useState({
    about_title: "",
    about_content: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSiteSettings();

        setFormData({
          about_title: settings.about_title || "",
          about_content: settings.about_content || "",
          phone: settings.phone || "",
          email: settings.email || "",
        });
      } catch (error) {
        console.error("Site ayarları alınamadı:", error);
        setErrorMessage("Site ayarları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await updateSiteSettings(formData);

      setSuccessMessage("Site ayarları başarıyla güncellendi.");
    } catch (error) {
      console.error("Site ayarları güncellenemedi:", error);

      setErrorMessage(
        error.message || "Site ayarları güncellenirken bir hata oluştu.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="py-10">
        <Container>
          <p className="text-novis-brown">Site ayarları yükleniyor...</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-10">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
              YÖNETİM PANELİ
            </p>

            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-novis-anthracite">
              Site Ayarları
            </h1>

            <p className="mt-2 text-sm text-novis-brown">
              Hakkımızda ve iletişim bilgilerinde gösterilen içerikleri buradan
              değiştirebilirsiniz.
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                  ✓ {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}

              <div>
                <h2 className="font-display text-xl font-bold text-novis-anthracite mb-4">
                  Hakkımızda
                </h2>

                <Input
                  label="Başlık"
                  name="about_title"
                  value={formData.about_title}
                  onChange={handleChange}
                  placeholder="Hakkımızda"
                  required
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-novis-anthracite mb-2">
                    Hakkımızda Yazısı
                  </label>

                  <textarea
                    name="about_content"
                    rows={10}
                    value={formData.about_content}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm resize-y"
                    placeholder="Firmanız hakkında bilgi..."
                  />

                  <p className="mt-2 text-xs text-novis-brown">
                    Paragraflar arasında boş satır bırakarak ayrı paragraflar
                    oluşturabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="border-t border-novis-bronze/20 pt-6">
                <h2 className="font-display text-xl font-bold text-novis-anthracite mb-4">
                  İletişim Bilgileri
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telefon"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0535 766 58 58"
                    required
                  />

                  <Input
                    label="E-posta"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@mail.com"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </section>
  );
}

export default SiteSettings;
