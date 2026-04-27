import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/axios";

const Simulate = () => {
  const [form, setForm] = useState({
    event_type: "mariage",
    budget: "",
    guest_count: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post("/suggestions", {
        event_type: form.event_type,
        budget: parseFloat(form.budget),
        guest_count: parseInt(form.guest_count, 10) || 100,
      });
      setResult(res.data);
    } catch {
      alert("Erreur de simulation.");
    }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>🎉 Simulation gratuite</h2>
        <p style={s.sub}>
          Découvrez ce que vous pourriez obtenir sans créer de compte.
        </p>
        <form onSubmit={handleSubmit} style={s.form}>
          <select
            value={form.event_type}
            onChange={(e) => setForm({ ...form, event_type: e.target.value })}
            style={s.input}
          >
            {["mariage", "anniversaire", "fête", "événement professionnel"].map(
              (t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ),
            )}
          </select>
          <input
            type="number"
            placeholder="Budget (MAD)"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            required
            style={s.input}
          />
          <input
            type="number"
            placeholder="Nombre d'invités"
            value={form.guest_count}
            onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
            style={s.input}
          />
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? "Simulation..." : "Simuler mon événement"}
          </button>
        </form>

        {result && (
          <div style={s.result}>
            <h3 style={{ color: "#b76e4b" }}>Résultat</h3>
            <p>
              Décoration : <strong>{result.suggestion.decoration_style}</strong>
            </p>
            <p>
              Éclairage : <strong>{result.suggestion.lighting_style}</strong>
            </p>
            <p>
              Prix estimé :{" "}
              <strong style={{ color: "#b76e4b" }}>
                {result.estimated_price?.toLocaleString()} MAD
              </strong>
            </p>
            <p style={{ marginTop: "15px", color: "#5a4a3f" }}>
              Pour personnaliser et réserver,{" "}
              <Link
                to="/register"
                style={{ color: "#b76e4b", fontWeight: "600" }}
              >
                créez un compte
              </Link>{" "}
              ou{" "}
              <Link to="/login" style={{ color: "#b76e4b", fontWeight: "600" }}>
                connectez-vous
              </Link>
              .
            </p>
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
    maxWidth: "500px",
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
  result: {
    marginTop: "25px",
    padding: "20px",
    background: "#f9f2ec",
    borderRadius: "12px",
    border: "1px solid #efe3d3",
  },
};

export default Simulate;
