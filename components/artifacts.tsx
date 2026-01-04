import { useRouter } from "next/router";

const ARTIFACTS = [
  {
    id: 1,
    name: "Rosetta Stone",
    era: "Ptolemaic Period",
    description:
      "A granodiorite stele that helped scholars decipher Egyptian hieroglyphs.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/Rosetta_Stone.JPG",
  },
  {
    id: 2,
    name: "Terracotta Army",
    era: "Qin Dynasty",
    description:
      "Thousands of life-sized clay soldiers buried with China's first emperor.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Terracotta_Army%2C_View_of_Pit_1.jpg",
  },
  {
    id: 3,
    name: "Antikythera Mechanism",
    era: "Ancient Greece",
    description:
      "An ancient analog computer used to predict astronomical positions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/NAMA_Machine_d%27Anticyth%C3%A8re_1.jpg",
  },
  {
    id: 4,
    name: "Venus of Willendorf",
    era: "Upper Paleolithic",
    description:
      "A limestone figurine believed to represent fertility and femininity.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Venus_of_Willendorf_01.jpg",
  },
];

export default function ArtifactsPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Artifacts</h1>
        <p style={styles.subtitle}>
          Iconic archaeological discoveries from human history.
        </p>
      </header>

      {/* Grid */}
      <section style={styles.grid}>
        {ARTIFACTS.map((a) => (
          <div
            key={a.id}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.imageWrapper}>
              <img src={a.image} alt={a.name} style={styles.image} />
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{a.name}</h3>
              <div style={styles.era}>{a.era}</div>
              <p style={styles.desc}>{a.description}</p>
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
