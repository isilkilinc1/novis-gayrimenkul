import { useParams } from "react-router-dom";
import Container from "../../components/ui/Container";

function PropertyDetail() {
  const { id } = useParams();

  return (
    <section className="py-20">
      <Container>
        <p className="text-sm text-novis-bronze">İlan ID: {id}</p>

        <h1 className="mt-3 font-display text-4xl font-bold text-novis-anthracite">
          İlan Detayı
        </h1>

        <p className="mt-4 text-novis-brown">
          Bu sayfa ilerleyen aşamada veritabanından gerçek ilan bilgilerini
          getirecek.
        </p>
      </Container>
    </section>
  );
}

export default PropertyDetail;
