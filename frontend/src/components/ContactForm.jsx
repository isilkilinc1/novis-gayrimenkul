import { useState } from "react";
import { sendContactRequest } from "../services/contactService";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function ContactForm({
  propertyId = null,
  propertyTitle = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await sendContactRequest({
        ...formData,
        property_id: propertyId,
      });

      setSuccessMessage(
        "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
      );
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      console.error("Form gönderilemedi:", err);
      setErrorMessage(
        "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-xs">
      <h3 className="font-display text-xl font-bold text-novis-anthracite mb-2">
        {propertyTitle
          ? `${propertyTitle} Hakkında Bilgi Alın`
          : "İletişime Geçin"}
      </h3>
      <p className="text-sm text-novis-brown mb-6">
        Formu doldurun, gayrimenkul danışmanlarımız sizinle hemen iletişime
        geçsin.
      </p>

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ad Soyad *"
          name="name"
          placeholder="Örn. Ayşe Yılmaz"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Telefon"
            name="phone"
            placeholder="0532..."
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="E-posta"
            name="email"
            type="email"
            placeholder="ayse@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-novis-anthracite mb-2">
            Mesajınız *
          </label>
          <textarea
            name="message"
            rows={4}
            placeholder="Merak ettiğiniz detayları buraya yazabilirsiniz..."
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full justify-center"
        >
          {loading ? "Gönderiliyor..." : "Gönder"}
        </Button>
      </form>
    </div>
  );
}
