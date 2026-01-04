import { useRouter } from "next/router";

const EXCAVATIONS = [
  {
    id: 1,
    name: "Pompeii",
    location: "Italy",
    period: "79 AD",
    description:
      "Roman city buried by volcanic ash, preserved with buildings, frescoes, and artifacts.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Insula_della_Via_dell%27Abbondanza_-_Pompeii.jpg",
  },
  {
    id: 2,
    name: "Machu Picchu",
    location: "Peru",
    period: "15th Century",
    description:
      "Incan citadel in the Andes Mountains, rediscovered in 1911 by Hiram Bingham.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/Machu_Picchu%2C_Peru.jpg",
  },
  {
    id: 3,
    name: "Stonehenge",
    location: "England",
    period: "3000–2000 BC",
    description:
      "Prehistoric monument of standing stones, famous for astronomical alignment.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d3/Stonehenge2007_07_30.jpg",
  },
  {
    id: 4,
    name: "Pompeii Amphitheater",
    location: "Italy",
    period: "80 AD",
    description:
      "One of the oldest surviving Roman amphitheaters, used for gladiatorial games.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/66/Pompeii_Amphitheater.JPG",
  },
  {
    id: 5,
    name: "Göbekli Tepe",
    location: "Turkey",
    period: "10th millennium BC",
    description:
      "A series of monumental circular structures that predate agriculture; rewrote prehistory timelines.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/79/Gobekli_Tepe_2013.jpg",
  },
  {
    id: 6,
    name: "Çatalhöyük",
    location: "Turkey",
    period: "Neolithic",
    description:
      "Large Neolithic proto-city with densely packed houses and rich symbolic art.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/86/Catalhoyuk.jpg",
  },
  {
    id: 7,
    name: "Valley of the Kings",
    location: "Egypt",
    period: "New Kingdom",
    description:
      "Royal necropolis near Luxor where many pharaohs were buried in elaborately decorated tombs.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Valley_of_the_Kings.jpg",
  },
  {
    id: 8,
    name: "Knossos",
    location: "Greece",
    period: "Bronze Age",
    description:
      "Palatial center of the Minoan civilization, associated with the legend of the Minotaur.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/Knossos_-_Palace_-_panoramio.jpg",
  },
  {
    id: 9,
    name: "Tikal",
    location: "Guatemala",
    period: "Classic Maya",
    description:
      "Major Maya city with towering temples set in dense rainforest, key for understanding Maya civilization.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/Tikal_Temple_IV.jpg",
  },
  {
    id: 10,
    name: "Ephesus",
    location: "Turkey",
    period: "Classical Antiquity",
    description:
      "Well-preserved Greco-Roman city with an impressive theatre and the Library of Celsus.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Ephesus_-_Library_of_Celsus,_west_side_(2013).jpg",
  },
];

export default function ExcavationsPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Excavations</h1>
        <p style={styles.subtitle}>
          Famous archaeological digs and sites around the world.
        </p>
      </header>

      {/* Grid */}
      <section style={styles.grid}>
        {EXCAVATIONS.map((site) => (
          <div
            key={site.id}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.imageWrapper}>
              <img src={site.image} alt={site.name} style={styles.image} />
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{site.name}</h3>
              <div style={styles.era}>{site.location} — {site.period}</div>
              <p style={styles.desc}>{site.description}</p>
            </div>
          </div>
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
    maxWidth: "600px",
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.5rem",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "#1a1a1e",
    border: "1px solid #2a2a33",
    borderRadius: "16px",
    overflow: "hidden",
    transition: "transform 0.25s ease",
    cursor: "pointer",
  },

  imageWrapper: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "transform 0.3s ease",
  },

  cardBody: {
    padding: "1.4rem",
  },

  cardTitle: {
    fontSize: "1.15rem",
    fontWeight: 600,
    marginBottom: "0.2rem",
  },

  era: {
    fontSize: "0.85rem",
    color: "#a1a1aa",
    marginBottom: "0.6rem",
  },

  desc: {
    fontSize: "0.95rem",
    color: "#d4d4d8",
    lineHeight: 1.5,
  },
};
