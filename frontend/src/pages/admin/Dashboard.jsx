import Container from "../../components/ui/Container";
import StatCard from "../../components/ui/StatCard"; // <-- StatCard bileşenimizi import ettik

function Dashboard() {
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

      {/* İstatistik Kartları Grid Yapısı */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aktif İlan"
          value="24"
          description="Yayındaki toplam gayrimenkul"
        />
        <StatCard
          title="Satılık"
          value="16"
          description="Satışta olan mülkler"
        />
        <StatCard title="Kiralık" value="8" description="Kiralık portföy" />
        <StatCard
          title="Yeni Talep"
          value="5"
          description="İletişim ve bilgi talepleri"
        />
      </div>

      {/* Son Talepler / Hızlı Bakış Bölümü */}
      <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm border border-novis-bronze/20">
        <h2 className="text-xl font-bold text-novis-anthracite mb-4">
          Son İletişim Talepleri
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 text-xs uppercase text-novis-brown">
              <tr>
                <th className="py-3 px-4">İsim</th>
                <th className="py-3 px-4">Talep Türü</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-novis-anthracite">
                  Ahmet Yılmaz
                </td>
                <td className="py-3 px-4">Satılık Ev</td>
                <td className="py-3 px-4">Bugün, 14:30</td>
                <td className="py-3 px-4">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Yeni
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-novis-anthracite">
                  Elif Kaya
                </td>
                <td className="py-3 px-4">Kiralık Daire</td>
                <td className="py-3 px-4">Dün, 11:15</td>
                <td className="py-3 px-4">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                    Yeni
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

export default Dashboard;
