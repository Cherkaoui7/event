import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";

const EVENT_TYPES = [
  "mariage",
  "anniversaire",
  "fête",
  "événement professionnel",
];

const Suggestions = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    event_type: "mariage",
    budget: "",
    guest_count: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/suggestions", {
        event_type: form.event_type,
        budget: parseFloat(form.budget),
        guest_count: parseInt(form.guest_count, 10) || 100,
      });
      setResult(res.data);
    } catch {
      setError("Impossible de générer une suggestion.");
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!result) return;
    try {
      const evRes = await apiClient.post("/events", {
        title: `Événement suggéré – ${form.event_type}`,
        event_type: form.event_type,
        guest_count: parseInt(form.guest_count, 10) || 100,
        budget: parseFloat(form.budget),
      });
      const eid = evRes.data.id;
      await apiClient.post(`/events/${eid}/room`, {
        decoration_style: result.suggestion.decoration_style,
        lighting_style: result.suggestion.lighting_style,
        table_layout: result.suggestion.table_layout,
      });
      for (const p of result.suggestion.plats) {
        if (p.id)
          await apiClient.post(`/events/${eid}/catering`, {
            catering_item_id: p.id,
            quantity: p.quantity,
          });
      }
      navigate(`/events/${eid}/customize`);
    } catch {
      setError("Erreur lors de la création de l'événement.");
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>💡 Suggestion personnalisée</h2>
        <p style={s.sub}>
          Entrez votre budget et nous configurons l'événement idéal pour vous.
        </p>
        <form onSubmit={handleSubmit} style={s.form}>
          <select
            name="event_type"
            value={form.event_type}
            onChange={handleChange}
            style={s.input}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <input
            name="budget"
            type="number"
            placeholder="Budget total (MAD)"
            value={form.budget}
            onChange={handleChange}
            required
            style={s.input}
          />
          <input
            name="guest_count"
            type="number"
            placeholder="Nombre d'invités"
            value={form.guest_count}
            onChange={handleChange}
            style={s.input}
          />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Analyse en cours..." : "✨ Obtenir une suggestion"}
          </button>
        </form>
        {error && <p style={s.error}>{error}</p>}

        {result && (
          <div style={s.result}>
            <h3 style={{ color: "#b76e4b" }}>Notre recommandation</h3>
            <div style={s.row}>
              <span>🔷 Décoration :</span>{" "}
              <strong>{result.suggestion.decoration_style}</strong>
            </div>
            <div style={s.row}>
              <span>💡 Éclairage :</span>{" "}
              <strong>{result.suggestion.lighting_style}</strong>
            </div>
            <div style={s.row}>
              <span>🪑 Disposition :</span>{" "}
              <strong>{result.suggestion.table_layout}</strong>
            </div>
            {result.suggestion.plats?.length > 0 && (
              <div style={s.row}>
                <span>🍲 Plats :</span>{" "}
                <strong>
                  {result.suggestion.plats
                    .map((p) => p.name || `ID ${p.id}`)
                    .join(", ")}
                </strong>
              </div>
            )}
            <p style={s.price}>
              Prix estimé : {result.estimated_price?.toLocaleString()} MAD
            </p>
            <button onClick={handleCreate} style={s.createBtn}>
              → Créer cet événement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  container: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "550px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    border: "1px solid #efe3d3",
  },
  heading: { color: "#b76e4b", margin: "0 0 5px" },
  sub: { color: "#7d8c7a", marginBottom: "25px", fontSize: "0.95rem" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd2c2",
    fontSize: "1rem",
    background: "#fcf9f5",
  },
  btn: {
    padding: "13px",
    background: "#b76e4b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: { color: "#c0392b", marginTop: "10px", textAlign: "center" },
  result: {
    marginTop: "25px",
    padding: "20px",
    background: "#f9f2ec",
    borderRadius: "14px",
    border: "1px solid #efe3d3",
  },
  row: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "0.95rem",
    alignItems: "center",
  },
  price: {
    fontWeight: "bold",
    color: "#b76e4b",
    fontSize: "1.2rem",
    margin: "12px 0",
  },
  createBtn: {
    width: "100%",
    padding: "12px",
    background: "#5a4a3f",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Suggestions;
