import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";

function Home() {
  return (
    <section className="py-24">
      <Container>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="max-w-3xl font-display text-5xl font-bold text-novis-anthracite md:text-6xl">
          Hayalinizdeki yaşam alanını keşfedin.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-novis-brown">
          Alım, satım, kiralama ve inşaat hizmetlerinde profesyonel gayrimenkul
          çözümleri.
        </p>

        <div className="mt-8 flex gap-4">
          <Button>İlanları İncele</Button>
          <Button variant="secondary">Bize Ulaşın</Button>
        </div>
      </Container>
    </section>
  );
}

export default Home;
