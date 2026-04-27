import { useState, useEffect } from "react";
import apiClient from "../../api/axios";

const PackSection = ({ eventId, onApply }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    apiClient
      .get("/packs")
      .then((r) => setPacks(r.data))
      .finally(() => setLoading(false));
  }, []);

  const applyPack = async (packId) => {
    if (
      !window.confirm(
        "Appliquer ce pack ? La configuration actuelle sera remplacée.",
      )
    )
      return;
    setApplying(packId);
    try {
      await apiClient.post(`/events/${eventId}/apply-pack`, {
        pack_id: packId,
      });
      onApply();
    } catch {
      alert("Erreur lors de l'application du pack.");
    }
    setApplying(null);
  };

  if (loading) return <p>Chargement des packs...</p>;

  return (
    <div style={s.grid}>
      {packs.map((pack) => (
        <div key={pack.id} style={s.card}>
          <h3 style={s.packName}>{pack.name}</h3>
          <p style={s.type}>📅 {pack.event_type}</p>
          <p style={s.desc}>{pack.description}</p>
          <div style={s.details}>
            <span>🔷 {pack.decoration_style}</span>
            <span>💡 {pack.lighting_style}</span>
            <span>🪑 {pack.table_layout}</span>
          </div>
          {pack.pack_caterings?.length > 0 && (
            <p style={s.platsLabel}>
              Traiteur inclus :{" "}
              {pack.pack_caterings
                .map((pc) => pc.catering_item?.name)
                .join(", ")}
            </p>
          )}
          <p style={s.price}>
            À partir de {pack.base_price?.toLocaleString()} MAD
          </p>
          <button
            onClick={() => applyPack(pack.id)}
            disabled={applying === pack.id}
            style={s.applyBtn}
          >
            {applying === pack.id ? "Application..." : "→ Appliquer ce pack"}
          </button>
        </div>
      ))}
    </div>
  );
};

const s = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "22px",
    border: "1px solid #efe3d3",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  packName: { color: "#b76e4b", margin: "0 0 4px", fontSize: "1.1rem" },
  type: { color: "#7d8c7a", fontSize: "0.85rem", margin: "0 0 8px" },
  desc: {
    color: "#5a4a3f",
    fontSize: "0.9rem",
    margin: "0 0 12px",
    lineHeight: "1.4",
  },
  details: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "0.85rem",
    color: "#7d8c7a",
  },
  platsLabel: {
    fontSize: "0.85rem",
    color: "#5a4a3f",
    margin: "0 0 10px",
    fontStyle: "italic",
  },
  price: {
    fontWeight: "bold",
    color: "#b76e4b",
    fontSize: "1.1rem",
    margin: "0 0 12px",
  },
  applyBtn: {
    width: "100%",
    padding: "10px",
    background: "#5a4a3f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
};

export default PackSection;
