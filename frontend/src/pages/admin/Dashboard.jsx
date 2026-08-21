import Container from "../../components/ui/Container";

function Dashboard() {
  return (
    <Container>
      <h1 className="font-display text-4xl font-bold text-novis-anthracite">
        Dashboard
      </h1>

      <p className="mt-3 text-novis-brown">
        NOVIS Gayrimenkul yönetim paneline hoş geldiniz.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-novis-bronze/20">
          <p className="text-sm text-gray-500">Toplam İlan</p>
          <p className="mt-2 text-3xl font-bold text-novis-anthracite">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-novis-bronze/20">
          <p className="text-sm text-gray-500">Müşteriler</p>
          <p className="mt-2 text-3xl font-bold text-novis-anthracite">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-novis-bronze/20">
          <p className="text-sm text-gray-500">Yeni Talepler</p>
          <p className="mt-2 text-3xl font-bold text-novis-anthracite">0</p>
        </div>
      </div>
    </Container>
  );
}

export default Dashboard;
