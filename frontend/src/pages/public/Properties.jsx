import Container from "../../components/ui/Container";

function Properties() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="font-display text-4xl font-bold text-novis-anthracite">
          Gayrimenkul İlanları
        </h1>

        <p className="mt-4 text-novis-brown">
          Satılık ve kiralık gayrimenkullerimizi keşfedin.
        </p>

        <div className="mt-10 rounded-xl border border-novis-bronze/20 bg-white p-10 text-center">
          <p className="text-novis-brown">Henüz ilan bulunmuyor.</p>
        </div>
      </Container>
    </section>
  );
}

export default Properties;
