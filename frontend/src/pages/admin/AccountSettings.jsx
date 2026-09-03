import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updateAdminAccount } from "../../services/authService";

function getSavedUserEmail() {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return "";
  }

  try {
    const user = JSON.parse(savedUser);
    return user.email || "";
  } catch {
    return "";
  }
}

function AccountSettings() {
  const [currentEmail, setCurrentEmail] = useState(getSavedUserEmail);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Mevcut şifrenizi girmelisiniz.");
      return;
    }

    if (!newEmail && !newPassword) {
      setError("Değiştirmek istediğiniz bilgiyi girin.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const data = await updateAdminAccount({
        currentPassword,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined,
      });

      // Backend tarafından gönderilen yeni JWT'yi kaydet
      localStorage.setItem("token", data.token);

      // Güncel kullanıcı bilgilerini kaydet
      localStorage.setItem("user", JSON.stringify(data.user));

      // Ekrandaki mevcut e-postayı güncelle
      setCurrentEmail(data.user.email);

      // Form alanlarını temizle
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
      setNewPasswordConfirm("");

      setMessage("Hesap bilgileriniz başarıyla güncellendi.");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Hesap bilgileri güncellenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-novis-anthracite">
          Hesap Ayarları
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Admin hesabınızın e-posta adresini ve şifresini buradan
          güncelleyebilirsiniz.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        {message && (
          <div className="mb-6 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-novis-anthracite">
              Hesap Bilgileri
            </h2>

            <div className="space-y-5">
              <Input
                label="Mevcut E-posta"
                type="email"
                value={currentEmail}
                readOnly
              />

              <Input
                label="Yeni E-posta"
                type="email"
                placeholder="Yeni e-posta adresiniz"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-semibold text-novis-anthracite">
              Şifre Değiştir
            </h2>

            <div className="space-y-5">
              <Input
                label="Mevcut Şifre"
                type="password"
                placeholder="Mevcut şifreniz"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="Yeni Şifre"
                type="password"
                placeholder="En az 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Yeni Şifre Tekrar"
                type="password"
                placeholder="Yeni şifrenizi tekrar girin"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountSettings;
