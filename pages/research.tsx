import { useRouter } from "next/router";

const RESEARCH = [
  {
    id: 1,
    title: "Ancient Egyptian Medicine",
    field: "Egyptology",
    description:
      "Study of medical practices, herbs, and surgical techniques in Ancient Egypt.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Egyptian_Medical_Papyrus.jpg",
  },
  {
    id: 2,
    title: "Roman Engineering",
    field: "Classical Studies",
    description:
      "Analysis of aqueducts, roads, and monumental architecture of the Roman Empire.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Aqua_Claudia.JPG",
  },
  {
    id: 3,
    title: "Mayan Astronomy",
    field: "Mesoamerican Studies",
    description:
      "Research on Mayan calendars, astronomical observations, and solar alignments.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/Mayan_Calendar_Stone.jpg",
  },
  {
    id: 4,
    title: "Neolithic Settlements",
    field: "Archaeology",
    description:
      "Excavations of early villages reveal social structure, tools, and domestic life.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Skara_Brae.jpg",
  },
];

export default function ResearchPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Research</h1>
        <p style={styles.subtitle}>
          Academic and popular studies on archaeology and ancient civilizations.
        </p>
      </header>

      {/* Grid */}
      <section style={styles.grid}>
        {RESEARCH.map((r) => (
          <div
            key={r.id}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.imageWrapper}>
              <img src={r.image} alt={r.title} style={styles.image} />
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{r.title}</h3>
              <div style={styles.field}>{r.field}</div>
              <p style={styles.desc}>{r.description}</p>
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

  field: {
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
