import { useState, useEffect } from "react";
import Container from "../../components/ui/Container";
import StatCard from "../../components/ui/StatCard";
import { getDashboardStats } from "../../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard verileri yüklenirken hata:", err);
        setError("İstatistikler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container>
      {/* Üst Başlık */}
      <div>
        <h1 className="font-display text-4xl font-bold text-novis-anthracite">
          Dashboard
        </h1>
        <p className="mt-2 text-novis-brown">
          NOVIS Gayrimenkul yönetim paneline hoş geldiniz. İşletmenizin genel
          durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Hata Durumu */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* İstatistik Kartları Grid Yapısı (Gerçek Veriler) */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam İlan"
          value={loading ? "..." : (stats?.totalProperties ?? 0)}
          description="Sistemdeki tüm kayıtlar"
        />
        <StatCard
          title="Aktif İlan"
          value={loading ? "..." : (stats?.activeProperties ?? 0)}
          description="Yayındaki toplam gayrimenkul"
        />
        <StatCard
          title="Satılık"
          value={loading ? "..." : (stats?.forSale ?? 0)}
          description="Satışta olan mülkler"
        />
        <StatCard
          title="Kiralık"
          value={loading ? "..." : (stats?.forRent ?? 0)}
          description="Kiralık portföy"
        />
        <StatCard
          title="Satılan"
          value={loading ? "..." : (stats?.sold ?? 0)}
          description="Satışı tamamlananlar"
        />
        <StatCard
          title="Kiralanan"
          value={loading ? "..." : (stats?.rented ?? 0)}
          description="Kiraya verilenler"
        />
        <StatCard
          title="Toplam Müşteri"
          value={loading ? "..." : (stats?.totalCustomers ?? 0)}
          description="CRM müşteri portföyü"
        />
        <StatCard
          title="Yeni Talep"
          value={loading ? "..." : (stats?.newContactRequests ?? 0)}
          description="Bekleyen iletişim talepleri"
        />
      </div>

      {/* Son Talepler / Hızlı Bakış Bölümü */}
      <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm border border-novis-bronze/20">
        <h2 className="text-xl font-bold text-novis-anthracite mb-4">
          Son İletişim Talepleri Özeti
        </h2>
        <p className="text-sm text-novis-brown">
          Yeni gelen iletişim taleplerinin detaylı yönetimi için sol menüden{" "}
          <strong className="text-novis-anthracite">İletişim Talepleri</strong>{" "}
          sayfasını ziyaret edebilirsiniz.
        </p>
      </div>
    </Container>
  );
}

export default Dashboard;
