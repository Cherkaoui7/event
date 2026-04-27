import { useState } from "react";

const SeatingChart = ({ guestCount, layout }) => {
  // Déterminer la capacité par table selon le layout
  const getTableCapacity = () => {
    switch (layout) {
      case "rectangulaire":
        return 10;
      case "u_shape":
        return 12;
      case "cocktail":
        return 4;
      default:
        return 8; // classique_rond
    }
  };

  const capacity = getTableCapacity();
  const numTables = Math.ceil((guestCount || 50) / capacity);

  // État local pour stocker les noms : { tableIndex: { seatIndex: "Nom" } }
  const [seats, setSeats] = useState({});

  const handleNameChange = (tIdx, sIdx, name) => {
    setSeats((prev) => ({
      ...prev,
      [tIdx]: {
        ...(prev[tIdx] || {}),
        [sIdx]: name,
      },
    }));
  };

  return (
    <div style={s.container}>
      <p style={s.desc}>
        Vous avez <strong>{guestCount} invités</strong>. Avec la disposition{" "}
        <strong>{layout?.replace("_", " ")}</strong> ({capacity} pers/table),
        nous avons préparé <strong>{numTables} tables</strong> pour vous.
      </p>

      <div style={s.grid}>
        {Array.from({ length: numTables }).map((_, tIdx) => (
          <div key={`table-${tIdx}`} style={s.tableCard}>
            <div style={s.tableHeader}>
              <h4 style={{ margin: 0, color: "#fff" }}>Table {tIdx + 1}</h4>
              <span
                style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}
              >
                {capacity} places
              </span>
            </div>

            <div style={s.seatsList}>
              {Array.from({ length: capacity }).map((_, sIdx) => {
                const isAssigned = seats[tIdx]?.[sIdx]?.trim().length > 0;
                return (
                  <div key={`seat-${sIdx}`} style={s.seatRow}>
                    <div
                      style={{
                        ...s.seatIcon,
                        background: isAssigned ? "#2e7d32" : "#efe3d3",
                      }}
                    >
                      {isAssigned ? "✓" : sIdx + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="Nom de l'invité..."
                      style={s.input}
                      value={seats[tIdx]?.[sIdx] || ""}
                      onChange={(e) =>
                        handleNameChange(tIdx, sIdx, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const s = {
  container: { marginTop: "10px" },
  desc: {
    color: "#5a4a3f",
    fontSize: "1.05rem",
    marginBottom: "20px",
    padding: "15px",
    background: "#fdfbf7",
    borderRadius: "8px",
    borderLeft: "4px solid #b76e4b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  tableCard: {
    border: "1px solid #efe3d3",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
  },
  tableHeader: {
    background: "#b76e4b",
    padding: "12px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seatsList: { padding: "15px" },
  seatRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  seatIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #eee",
    borderRadius: "6px",
    fontSize: "0.9rem",
    outline: "none",
  },
};

export default SeatingChart;
