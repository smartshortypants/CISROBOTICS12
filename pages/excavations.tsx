import Image from "next/image";
import { useRouter } from "next/router";

type Site = {
  id: number;
  name: string;
  location: string;
  period: string;
  description: string;
  image: string;
  source: string;
};

const EXCAVATIONS: Site[] = [
  {
    id: 1,
    name: "Pompeii",
    location: "Italy",
    period: "79 AD",
    description: "Roman city buried by volcanic ash, preserved with buildings, frescoes, and artifacts.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Insula_della_Via_dell%27Abbondanza_-_Pompeii.jpg",
    source: "https://en.wikipedia.org/wiki/Pompeii",
  },
  {
    id: 2,
    name: "Machu Picchu",
    location: "Peru",
    period: "15th Century",
    description: "Incan citadel in the Andes Mountains, rediscovered in 1911 by Hiram Bingham.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Machu_Picchu%2C_Peru.jpg",
    source: "https://en.wikipedia.org/wiki/Machu_Picchu",
  },
  {
    id: 3,
    name: "Stonehenge",
    location: "England",
    period: "3000–2000 BC",
    description: "Prehistoric monument of standing stones, famous for astronomical alignment.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Stonehenge2007_07_30.jpg",
    source: "https://en.wikipedia.org/wiki/Stonehenge",
  },
  {
    id: 4,
    name: "Göbekli Tepe",
    location: "Turkey",
    period: "10th millennium BC",
    description: "Monumental circular structures that predate agriculture and rewrote prehistory timelines.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/79/Gobekli_Tepe_2013.jpg",
    source: "https://en.wikipedia.org/wiki/G%C3%B6bekli_Tepe",
  },
  {
    id: 5,
    name: "Çatalhöyük",
    location: "Turkey",
    period: "Neolithic",
    description: "Large Neolithic proto-city with densely packed houses and rich symbolic art.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Catalhoyuk.jpg",
    source: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk",
  },
  {
    id: 6,
    name: "Valley of the Kings",
    location: "Egypt",
    period: "New Kingdom",
    description: "Royal necropolis near Luxor where many pharaohs were buried in decorated tombs.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Valley_of_the_Kings.jpg",
    source: "https://en.wikipedia.org/wiki/Valley_of_the_Kings",
  },
  {
    id: 7,
    name: "Knossos",
    location: "Greece",
    period: "Bronze Age",
    description: "Palatial center of the Minoan civilization, associated with the legend of the Minotaur.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Knossos_-_Palace_-_panoramio.jpg",
    source: "https://en.wikipedia.org/wiki/Knossos",
  },
  {
    id: 8,
    name: "Tikal",
    location: "Guatemala",
    period: "Classic Maya",
    description: "Major Maya city with towering temples set in dense rainforest.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Tikal_Temple_IV.jpg",
    source: "https://en.wikipedia.org/wiki/Tikal",
  },
  {
    id: 9,
    name: "Ephesus",
    location: "Turkey",
    period: "Classical Antiquity",
    description: "Well-preserved Greco-Roman city with an impressive theatre and the Library of Celsus.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Ephesus_-_Library_of_Celsus,_west_side_(2013).jpg",
    source: "https://en.wikipedia.org/wiki/Ephesus",
  },
  {
    id: 10,
    name: "Çatalhöyük (West Mound)",
    location: "Turkey",
    period: "Neolithic",
    description: "Extensive excavations revealed densely packed mud-brick houses and wall paintings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/68/Catalhoyuk_mural.jpg",
    source: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk",
  },
  {
    id: 11,
    name: "Knob Hill (Aleutian)",
    location: "Alaska, USA",
    period: "Holocene",
    description: "Important coastal archaeological site with shell middens and habitation evidence.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/75/Archaeological_site.jpg",
    source: "https://en.wikipedia.org/wiki/Archaeology_of_the_Aleutians",
  },
  {
    id: 12,
    name: "Mohenjo-daro",
    location: "Pakistan",
    period: "Indus Valley Civilization",
    description: "One of the largest settlements of the ancient Indus Valley with advanced urban planning.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Mohenjo-daro.jpg",
    source: "https://en.wikipedia.org/wiki/Mohenjo-daro",
  },
  {
    id: 13,
    name: "Catalhoyuk (East Mound)",
    location: "Turkey",
    period: "Neolithic",
    description: "Neighboring mound with complementary finds that deepen understanding of early farming communities.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Catalhoyuk_street.jpg",
    source: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk",
  },
  {
    id: 14,
    name: "Çatalhöyük Shrine",
    location: "Turkey",
    period: "Neolithic",
    description: "Shrine with bull-head installations and symbolic wall paintings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Catalhoyuk_bull_shrine.jpg",
    source: "https://en.wikipedia.org/wiki/%C3%87atalh%C3%B6y%C3%BCk",
  },
  {
    id: 15,
    name: "Skara Brae",
    location: "Scotland",
    period: "Neolithic",
    description: "Exceptionally preserved Neolithic village revealing domestic architecture.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Skara_Brae.jpg",
    source: "https://en.wikipedia.org/wiki/Skara_Brae",
  },
  {
    id: 16,
    name: "Açuleia (Roman Ruins)",
    location: "Portugal",
    period: "Roman",
    description: "A Roman town with mosaic floors and remains of public buildings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Conimbriga_02.jpg",
    source: "https://en.wikipedia.org/wiki/Conimbriga",
  },
  {
    id: 17,
    name: "Ban Chiang",
    location: "Thailand",
    period: "Bronze Age",
    description: "Important prehistoric site known for early metallurgy and pottery.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/73/Ban_Chiang_museum.jpg",
    source: "https://en.wikipedia.org/wiki/Ban_Chiang",
  },
  {
    id: 18,
    name: "Tomb of Tutankhamun",
    location: "Egypt",
    period: "New Kingdom",
    description: "Howard Carter's excavation revealed a nearly intact royal tomb with rich grave goods.",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Tutankhamun%27s_mask.jpg",
    source: "https://en.wikipedia.org/wiki/Tomb_of_Tutankhamun",
  },
  {
    id: 19,
    name: "Caral",
    location: "Peru",
    period: "Norte Chico civilization",
    description: "One of the oldest urban centers in the Americas with monumental architecture.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/55/Caral.jpg",
    source: "https://en.wikipedia.org/wiki/Caral",
  },
  {
    id: 20,
    name: "Ohalo II",
    location: "Israel",
    period: "Epipaleolithic",
    description: "A lakeside site preserving huts and organic remains providing insight into forager lifeways.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Ohalo_site.jpg",
    source: "https://en.wikipedia.org/wiki/Ohalo",
  },
];

export default function ExcavationsPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Excavations</h1>
        <p style={styles.subtitle}>Famous archaeological digs and sites — click a card to open an authoritative source.</p>
      </header>

      <section style={styles.grid}>
        {EXCAVATIONS.map((site) => (
          <a key={site.id} href={site.source} target="_blank" rel="noopener noreferrer" style={styles.cardLink}>
            <div style={styles.card}>
              <div style={styles.imageWrapper}>
                <Image src={site.image} alt={site.name} style={styles.image as any} fill sizes="(max-width:600px) 100vw, 33vw" />
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{site.name}</h3>
                <div style={styles.era}>
                  {site.location} — {site.period}
                </div>
                <p style={styles.desc}>{site.description}</p>
                <div style={styles.source}>Source ↗</div>
              </div>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b0b0d",
    color: "#ffffff",
    padding: "4rem 2rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    maxWidth: "1000px",
    margin: "0 auto 3rem",
    textAlign: "center" as const,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#a1a1aa",
    cursor: "pointer",
    fontSize: "0.95rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 700,
    marginBottom: "0.4rem",
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: "1rem",
    maxWidth: "800px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
  },
  card: {
    backgroundColor: "#1a1a1e",
    border: "1px solid #2a2a33",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "pointer",
  },
  imageWrapper: {
    position: "relative" as const,
    width: "100%",
    height: "200px",
    overflow: "hidden",
  },
  image: {
    objectFit: "cover" as const,
    transition: "transform 0.3s ease",
  },
  cardBody: {
    padding: "1rem",
  },
  cardTitle: {
    fontSize: "1.15rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  era: {
    fontSize: "0.85rem",
    color: "#a1a1aa",
    marginBottom: "0.6rem",
  },
  desc: {
    fontSize: "0.95rem",
    color: "#d4d4d8",
    lineHeight: 1.45,
  },
  source: {
    marginTop: "0.75rem",
    fontSize: "0.85rem",
    color: "#9fb8ff",
    fontWeight: 600,
  },
};
