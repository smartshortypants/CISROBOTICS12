import Image from "next/image";
import { useRouter } from "next/router";

type Artifact = {
  id: number;
  name: string;
  era: string;
  description: string;
  image: string;
  source: string;
};

const ARTIFACTS: Artifact[] = [
  {
    id: 1,
    name: "Rosetta Stone",
    era: "Ptolemaic Period",
    description: "A granodiorite stele that helped scholars decipher Egyptian hieroglyphs.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Rosetta_Stone.JPG",
    source: "https://en.wikipedia.org/wiki/Rosetta_Stone",
  },
  {
    id: 2,
    name: "Terracotta Army",
    era: "Qin Dynasty",
    description: "Thousands of life-sized clay soldiers buried with China's first emperor.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Terracotta_Army%2C_View_of_Pit_1.jpg",
    source: "https://en.wikipedia.org/wiki/Terracotta_Army",
  },
  {
    id: 3,
    name: "Antikythera Mechanism",
    era: "Ancient Greece",
    description: "An ancient analog computer used to predict astronomical positions.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2b/NAMA_Machine_d%27Anticyth%C3%A8re_1.jpg",
    source: "https://en.wikipedia.org/wiki/Antikythera_mechanism",
  },
  {
    id: 4,
    name: "Venus of Willendorf",
    era: "Upper Paleolithic",
    description: "A limestone figurine believed to represent fertility and femininity.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Venus_of_Willendorf_01.jpg",
    source: "https://en.wikipedia.org/wiki/Venus_of_Willendorf",
  },
  {
    id: 5,
    name: "Sutton Hoo Helmet",
    era: "Early Medieval",
    description: "Decorated Anglo-Saxon helmet found in an elite burial ship in England.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Sutton_Hoo_helmet_front.jpg",
    source: "https://en.wikipedia.org/wiki/Sutton_Hoo_helmet",
  },
  {
    id: 6,
    name: "Dead Sea Scrolls",
    era: "Second Temple Period",
    description: "Ancient Jewish manuscripts discovered in the Qumran Caves.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Great_Isaiah_Scroll.jpg",
    source: "https://en.wikipedia.org/wiki/Dead_Sea_Scrolls",
  },
  {
    id: 7,
    name: "Lascaux Cave Paintings",
    era: "Upper Paleolithic",
    description: "Complex cave paintings in southwestern France depicting animals and symbols.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Lascaux_05.jpg",
    source: "https://en.wikipedia.org/wiki/Lascaux",
  },
  {
    id: 8,
    name: "Standard of Ur",
    era: "Early Dynastic Mesopotamia",
    description: "A wooden box inlaid with mosaics showing scenes of war and peace.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/68/Standard_of_Ur_British_Museum.jpg",
    source: "https://en.wikipedia.org/wiki/Standard_of_Ur",
  },
  {
    id: 9,
    name: "Olduvai Stone Tools",
    era: "Lower Paleolithic",
    description: "Early hominin stone tools that provide insight into the origins of technology.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/80/Oldowan_tools.jpg",
    source: "https://en.wikipedia.org/wiki/Oldowan",
  },
  {
    id: 10,
    name: "Bayeux Tapestry",
    era: "11th Century",
    description: "An embroidered cloth depicting the events leading up to the Norman conquest of England.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Bayeux_Tapestry_scene21_Harold.jpg",
    source: "https://en.wikipedia.org/wiki/Bayeux_Tapestry",
  },
  {
    id: 11,
    name: "Nefertiti Bust",
    era: "Amarna Period",
    description: "Limestone bust of Queen Nefertiti, celebrated for its beauty and craftsmanship.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nefertiti_Bust.png",
    source: "https://en.wikipedia.org/wiki/Nefertiti",
  },
  {
    id: 12,
    name: "Mask of Agamemnon",
    era: "Mycenaean Greece",
    description: "A gold funeral mask discovered at Mycenae, once attributed to Agamemnon.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Mask_of_Agamemnon_11.jpg",
    source: "https://en.wikipedia.org/wiki/Mask_of_Agamemnon",
  },
  {
    id: 13,
    name: "Mayan Blue Murals",
    era: "Classic Maya",
    description: "Durable blue pigments used in murals and artifacts by the Maya.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Maya_blue.jpg",
    source: "https://en.wikipedia.org/wiki/Maya_blue",
  },
  {
    id: 14,
    name: "Shroud of Turin",
    era: "Medieval (disputed)",
    description: "A linen cloth bearing the image of a man; its origin remains debated.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Shroud_of_Turin_Negative.jpg",
    source: "https://en.wikipedia.org/wiki/Shroud_of_Turin",
  },
  {
    id: 15,
    name: "Mayan Jade Mask",
    era: "Pre-Columbian",
    description: "Elaborate jade funerary masks used by Maya elites.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/15/Mayan_Jade_mask.jpg",
    source: "https://en.wikipedia.org/wiki/Maya_civilization",
  },
  {
    id: 16,
    name: "Sumerian Cuneiform Tablet",
    era: "Ancient Mesopotamia",
    description: "Clay tablets bearing one of the earliest writing systems: cuneiform.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Uruk_tablet.jpeg",
    source: "https://en.wikipedia.org/wiki/Cuneiform",
  },
  {
    id: 17,
    name: "Oxus Treasure",
    era: "Achaemenid-era",
    description: "A collection of Achaemenid metalwork found near the Oxus River.",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Oxus_treasure_11.jpg",
    source: "https://en.wikipedia.org/wiki/Oxus_Treasure",
  },
  {
    id: 18,
    name: "Ushabti Figurines",
    era: "Ancient Egypt",
    description: "Funerary figurines intended to act as servants for the deceased in the afterlife.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ushabti.jpg",
    source: "https://en.wikipedia.org/wiki/Ushabti",
  },
  {
    id: 19,
    name: "Lycurgus Cup",
    era: "Late Roman",
    description: "A dichroic glass cup that changes color depending on lighting.",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Lycurgus_cup%2C_BM.jpg",
    source: "https://en.wikipedia.org/wiki/Lycurgus_cup",
  },
  {
    id: 20,
    name: "Shang Dynasty Bronzes",
    era: "Late Bronze Age China",
    description: "Elaborate ritual vessels and weapons cast in bronze.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/02/Shang_dynasty_bronze.jpg",
    source: "https://en.wikipedia.org/wiki/Shang_dynasty",
  },
];

export default function ArtifactsPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Artifacts</h1>
        <p style={styles.subtitle}>Iconic archaeological discoveries from world history. Click a card to view its source.</p>
      </header>

      <section style={styles.grid}>
        {ARTIFACTS.map((a) => (
          <a
            key={a.id}
            href={a.source}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.cardLink}
          >
            <div style={styles.card}>
              <div style={styles.imageWrapper}>
                <Image src={a.image} alt={a.name} style={styles.image as any} fill sizes="(max-width: 600px) 100vw, 33vw" />
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{a.name}</h3>
                <div style={styles.era}>{a.era}</div>
                <p style={styles.desc}>{a.description}</p>
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
