import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.status === 422
          ? "Email ou mot de passe incorrect."
          : "Une erreur est survenue.",
      );
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h1 style={s.title}>DOMINATORES</h1>
        <p style={s.subtitle}>Connectez-vous à votre compte</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={s.input}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={s.input}
          />
          <button type="submit" style={s.button}>
            Se connecter
          </button>
        </form>
        <p style={s.linkText}>
          Pas encore de compte ?{" "}
          <Link to="/register" style={s.link}>
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

const s = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#fdfbf7 0%,#f4ede4 100%)",
    fontFamily: "'Poppins',sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid #efe3d3",
  },
  title: {
    textAlign: "center",
    color: "#b76e4b",
    marginBottom: "5px",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  subtitle: { textAlign: "center", color: "#7d8c7a", marginBottom: "25px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd2c2",
    fontSize: "1rem",
    outline: "none",
    background: "#fcf9f5",
  },
  button: {
    padding: "12px",
    background: "#b76e4b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: { color: "#c0392b", textAlign: "center", marginBottom: "10px" },
  linkText: { textAlign: "center", marginTop: "20px", color: "#6b5e53" },
  link: { color: "#b76e4b", textDecoration: "none", fontWeight: "600" },
};

export default Login;
