import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginAdmin } from "../../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- 1. Loading state'ini ekledik
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // <-- 2. İstek başladığında loading'i true yapıyoruz

    try {
      // Backend API'ye istek atıyoruz
      const data = await loginAdmin(email, password);

      // Başarılı olursa token'ı tarayıcıya kaydediyoruz
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Admin paneline yönlendiriyoruz
      navigate("/admin");
    } catch (err) {
      // Hata mesajını yakalayıp ekranda gösteriyoruz
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Giriş yapılırken bir hata oluştu.");
      }
    } finally {
      setLoading(false); // <-- 3. İşlem bittiğinde (başarılı veya hatalı) loading'i false yapıyoruz
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-novis-anthracite px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-novis-anthracite">
            NOVIS
          </h1>
          <p className="mt-2 text-sm text-novis-brown">Yönetim Paneli</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="E-posta"
            name="email"
            type="email"
            placeholder="admin@novis.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Şifre"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 4. Butona disabled ve dinamik yazı özelliğini bağladık */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-novis-bronze hover:text-novis-gold"
        >
          Siteye Dön
        </Link>
      </div>
    </div>
  );
}

export default Login;
