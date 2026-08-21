import Container from "../../components/ui/Container";

function About() {
  return (
    <section className="py-20">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="mt-3 font-display text-4xl font-bold text-novis-anthracite">
          Hakkımızda
        </h1>

        <p className="mt-6 max-w-3xl leading-8 text-novis-brown">
          NOVIS Gayrimenkul; alım, satım, kiralama ve inşaat alanlarında
          profesyonel hizmet sunan lider bir gayrimenkul firmasıdır.
        </p>
      </Container>
    </section>
  );
}

export default About;
