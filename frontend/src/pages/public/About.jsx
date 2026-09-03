import Container from "../../components/ui/Container";

function About() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Sol Taraf - Yazılar */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
              NOVIS GAYRİMENKUL
            </p>

            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-novis-anthracite">
              Hakkımızda
            </h1>

            <div className="mt-6 space-y-5 max-w-2xl">
              <p className="leading-8 text-novis-brown">
                NOVIS Gayrimenkul; alım, satım, kiralama ve inşaat alanlarında
                profesyonel hizmet sunan bir gayrimenkul firmasıdır.
              </p>

              <p className="leading-8 text-novis-brown">
                Müşterilerimizin ihtiyaçlarını doğru şekilde anlayarak,
                güvenilir ve şeffaf bir hizmet anlayışıyla kendileri için en
                uygun gayrimenkul seçeneklerine ulaşmalarına yardımcı oluyoruz.
              </p>

              <p className="leading-8 text-novis-brown">
                Amacımız yalnızca bir gayrimenkul işlemi gerçekleştirmek değil,
                müşterilerimiz için güvene dayalı ve uzun süreli ilişkiler
                kurmaktır.
              </p>
            </div>
          </div>

          {/* Sağ Taraf - Logo */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 rounded-3xl bg-novis-gold/10 blur-2xl"></div>

              <div className="relative flex items-center justify-center rounded-3xl-novis-bronze/20 ">
                <img
                  src="/images/novis-logo.png"
                  alt="NOVIS Gayrimenkul Logo"
                  className="w-full max-w-100 h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default About;
