import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-novis-anthracite px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-novis-anthracite">
            NOVIS
          </h1>
          <p className="mt-2 text-sm text-novis-brown">Yönetim Paneli</p>
        </div>

        <form className="space-y-5">
          <Input
            label="E-posta"
            name="email"
            type="email"
            placeholder="admin@novis.com"
          />

          <Input
            label="Şifre"
            name="password"
            type="password"
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full">
            Giriş Yap
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
