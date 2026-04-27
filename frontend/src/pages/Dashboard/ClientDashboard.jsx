import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/axios";

const STATUS_LABELS = {
  draft: "Brouillon",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};
const STATUS_COLORS = {
  draft: "#f0a500",
  confirmed: "#2e7d32",
  cancelled: "#c0392b",
};

const ClientDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/events")
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.heading}>Mes événements</h2>
        <Link to="/events/create" style={s.createBtn}>
          + Créer un événement
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : events.length === 0 ? (
        <div style={s.empty}>
          <p>Aucun événement pour le moment.</p>
          <Link to="/events/create" style={s.createBtn}>
            Créer votre premier événement
          </Link>
        </div>
      ) : (
        <div style={s.grid}>
          {events.map((ev) => (
            <div key={ev.id} style={s.card}>
              <div
                style={{
                  ...s.statusBadge,
                  background: STATUS_COLORS[ev.status] || "#999",
                }}
              >
                {STATUS_LABELS[ev.status] || ev.status}
              </div>
              <h3 style={s.cardTitle}>{ev.title}</h3>
              <p style={s.meta}>📅 {ev.event_type}</p>
              <p style={s.meta}>👥 {ev.guest_count} invités</p>
              <p style={s.price}>{ev.total_price} MAD</p>
              <div style={s.cardActions}>
                <Link to={`/events/${ev.id}/customize`} style={s.editBtn}>
                  Personnaliser
                </Link>
                <Link to={`/events/${ev.id}/summary`} style={s.viewBtn}>
                  Récapitulatif
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  container: { padding: "40px", maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  heading: { color: "#5a4a3f", margin: 0 },
  createBtn: {
    background: "#b76e4b",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "600",
  },
  empty: { textAlign: "center", padding: "60px", color: "#7d8c7a" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #efe3d3",
    position: "relative",
  },
  statusBadge: {
    display: "inline-block",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "10px",
  },
  cardTitle: { margin: "0 0 10px", color: "#333" },
  meta: { color: "#7d8c7a", margin: "4px 0", fontSize: "0.9rem" },
  price: {
    fontWeight: "bold",
    color: "#b76e4b",
    fontSize: "1.1rem",
    margin: "10px 0",
  },
  cardActions: { display: "flex", gap: "10px", marginTop: "15px" },
  editBtn: {
    flex: 1,
    textAlign: "center",
    background: "#b76e4b",
    color: "#fff",
    padding: "8px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  viewBtn: {
    flex: 1,
    textAlign: "center",
    background: "#f1ede6",
    color: "#5a4a3f",
    padding: "8px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
};

export default ClientDashboard;
