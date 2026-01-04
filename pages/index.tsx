import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>ArcheoHub</h1>
        <p style={styles.subtitle}>
          Explore archaeology, artifacts, and ancient history with AI.
        </p>
      </section>

      <section style={styles.grid}>
        <Card
          icon="🏺"
          title="Artifacts"
          desc="Browse historical artifacts and relics."
          onClick={() => router.push("/artifacts")}
        />
        <Card
          icon="⛏"
          title="Excavations"
          desc="Discover ongoing and past excavations."
          onClick={() => router.push("/excavations")}
        />
        <Card
          icon="📚"
          title="Research"
          desc="Read simplified and academic research."
          onClick={() => router.push("/research")}
        />
        <Card
          icon="💬"
          title="AI Chat"
          desc="Ask questions about ancient civilizations."
          onClick={() => router.push("/chat")}
        />
      </section>
    </main>
  );
}

function Card({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <div
      style={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "#3f3f46";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#2a2a33";
      }}
    >
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDesc}>{desc}</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0b0b0d",
    color: "#ffffff",
    padding: "5rem 2rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  hero: {
    textAlign: "center" as const,
    marginBottom: "4rem",
  },

  title: {
    fontSize: "2.8rem",
    fontWeight: 700,
    marginBottom: "0.8rem",
  },

  subtitle: {
    color: "#a1a1aa",
    fontSize: "1.1rem",
    maxWidth: "600px",
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },

  card: {
    backgroundColor: "#1a1a1e",
    border: "1px solid #2a2a33",
    borderRadius: "14px",
    padding: "1.8rem",
    cursor: "pointer",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },

  icon: {
    fontSize: "1.8rem",
    marginBottom: "0.8rem",
  },

  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.4rem",
  },

  cardDesc: {
    fontSize: "0.95rem",
    color: "#a1a1aa",
    lineHeight: 1.5,
  },
};
