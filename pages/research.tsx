import Image from "next/image";
import { useRouter } from "next/router";

type Research = {
  id: number;
  title: string;
  field: string;
  description: string;
  image: string;
  source: string;
};

const RESEARCH: Research[] = [
  {
    id: 1,
    title: "Ancient Egyptian Medicine",
    field: "Egyptology",
    description: "Study of medical practices, herbs, and surgical techniques in Ancient Egypt.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Egyptian_Medical_Papyrus.jpg",
    source: "https://en.wikipedia.org/wiki/Ancient_Egyptian_medicine",
  },
  {
    id: 2,
    title: "Roman Engineering",
    field: "Classical Studies",
    description: "Analysis of aqueducts, roads, and monumental architecture of the Roman Empire.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/Aqua_Claudia.JPG",
    source: "https://en.wikipedia.org/wiki/Roman_engineering",
  },
  {
    id: 3,
    title: "Mayan Astronomy",
    field: "Mesoamerican Studies",
    description: "Research on Mayan calendars, astronomical observations, and solar alignments.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/84/Mayan_Calendar_Stone.jpg",
    source: "https://en.wikipedia.org/wiki/Maya_astronomy",
  },
  {
    id: 4,
    title: "Neolithic Settlements",
    field: "Archaeology",
    description: "Excavations of early villages reveal social structure, tools, and domestic life.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Skara_Brae.jpg",
    source: "https://en.wikipedia.org/wiki/Neolithic",
  },
  {
    id: 5,
    title: "Ancient DNA Studies",
    field: "Bioarchaeology",
    description: "Genetic analysis of ancient remains to trace migrations and relationships.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DNA_double_helix_horizontal_by_Higuchi.jpg",
    source: "https://en.wikipedia.org/wiki/Ancient_DNA",
  },
  {
    id: 6,
    title: "Underwater Archaeology",
    field: "Maritime Archaeology",
    description: "Study of shipwrecks and submerged settlements to recover material culture and trade networks.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Underwater_archaeology.jpg",
    source: "https://en.wikipedia.org/wiki/Underwater_archaeology",
  },
  {
    id: 7,
    title: "Paleoclimate Reconstruction",
    field: "Environmental Archaeology",
    description: "Using proxies like pollen and isotopes to understand past climates and human adaptation.",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/49/Climate_change.jpg",
    source: "https://en.wikipedia.org/wiki/Paleoclimatology",
  },
  {
    id: 8,
    title: "Zooarchaeology",
    field: "Archaeozoology",
    description: "Analysis of animal remains to reconstruct diets, domestication, and human-animal relationships.",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Zooarchaeology.jpg",
    source: "https://en.wikipedia.org/wiki/Zooarchaeology",
  },
  {
    id: 9,
    title: "Geoarchaeology",
    field: "Geoarchaeology",
    description: "Applying geological techniques to archaeological contexts to understand site formation.",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/10/Geoarchaeology.jpg",
    source: "https://en.wikipedia.org/wiki/Geoarchaeology",
  },
  {
    id: 10,
    title: "Remote Sensing in Archaeology",
    field: "Survey Methods",
    description: "Use of LiDAR, satellite imagery, and aerial photography to detect archaeological sites.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3a/LiDAR_scan.jpg",
    source: "https://en.wikipedia.org/wiki/Remote_sensing_in_archaeology",
  },
  {
    id: 11,
    title: "Isotope Analysis",
    field: "Archaeometry",
    description: "Isotopic studies of bones and teeth to infer diet, mobility, and provenance.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Isotope_mass_spectrometer.jpg",
    source: "https://en.wikipedia.org/wiki/Isotope_analysis",
  },
  {
    id: 12,
    title: "Textile Analysis",
    field: "Conservation",
    description: "Study of ancient fabrics and weaving techniques revealing trade and technology.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Ancient_textiles.jpg",
    source: "https://en.wikipedia.org/wiki/Textile_archaeology",
  },
  {
    id: 13,
    title: "Ancient Metallurgy",
    field: "Archaeometallurgy",
    description: "Investigations into metal production, alloying, and technological progression.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/02/Ancient_metal_working.jpg",
    source: "https://en.wikipedia.org/wiki/Metallurgy#History",
  },
  {
    id: 14,
    title: "Human Remains & Bioarchaeology",
    field: "Bioarchaeology",
    description: "Study of skeletal remains to reconstruct health, trauma, and cultural practices.",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/86/Human_skeleton.jpg",
    source: "https://en.wikipedia.org/wiki/Bioarchaeology",
  },
  {
    id: 15,
    title: "Ceramic Analysis",
    field: "Material Culture",
    description: "Typology and compositional studies of pottery to date and source artifacts.",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Ancient_pottery.jpg",
    source: "https://en.wikipedia.org/wiki/Ceramic_analysis",
  },
  {
    id: 16,
    title: "Experimental Archaeology",
    field: "Methodology",
    description: "Recreating past technologies and processes to test hypotheses about how things were made.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Experimental_archaeology.jpg",
    source: "https://en.wikipedia.org/wiki/Experimental_archaeology",
  },
  {
    id: 17,
    title: "Rock Art Studies",
    field: "Field Archaeology",
    description: "Recording and interpreting prehistoric engravings and paintings on rock surfaces.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/60/Rock_art_montage.jpg",
    source: "https://en.wikipedia.org/wiki/Rock_art",
  },
  {
    id: 18,
    title: "Maritime Trade Networks",
    field: "Economic Archaeology",
    description: "Research into seafaring, ship construction, and ancient trade corridors.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Ancient_shipwreck.jpg",
    source: "https://en.wikipedia.org/wiki/Maritime_archaeology",
  },
  {
    id: 19,
    title: "Paleoethnobotany",
    field: "Environmental Archaeology",
    description: "Study of plant remains to reconstruct diet, agriculture, and environment.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Paleoethnobotany.jpg",
    source: "https://en.wikipedia.org/wiki/Paleoethnobotany",
  },
  {
    id: 20,
    title: "Landscape Archaeology",
    field: "Survey",
    description: "Understanding human activity across territories using survey, remote sensing, and GIS.",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Landscape_archaeology.jpg",
    source: "https://en.wikipedia.org/wiki/Landscape_archaeology",
  },
];

export default function ResearchPage() {
  const router = useRouter();

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push("/")}>
          ← Back
        </button>
        <h1 style={styles.title}>Research</h1>
        <p style={styles.subtitle}>Academic and popular studies on archaeology and ancient civilizations. Click a card for more.</p>
      </header>

      <section style={styles.grid}>
        {RESEARCH.map((r) => (
          <a key={r.id} href={r.source} target="_blank" rel="noopener noreferrer" style={styles.cardLink}>
            <div style={styles.card}>
              <div style={styles.imageWrapper}>
                <Image src={r.image} alt={r.title} style={styles.image as any} fill sizes="(max-width:600px) 100vw, 33vw" />
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{r.title}</h3>
                <div style={styles.field}>{r.field}</div>
                <p style={styles.desc}>{r.description}</p>
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
  field: {
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
