import { useState } from "react";

const PaymentModal = ({ totalAmount, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const depositAmount = totalAmount * 0.3; // 30% d'acompte

  const handlePay = (e) => {
    e.preventDefault();
    if (cardNumber.length < 16) return alert("Numéro de carte invalide");

    setProcessing(true);
    // Simulation de traitement bancaire
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h3 style={s.title}>🔒 Paiement Sécurisé</h3>
          <button onClick={onClose} style={s.closeBtn}>
            ✕
          </button>
        </div>

        <div style={s.body}>
          <p style={s.desc}>
            Pour confirmer fermement votre réservation, le paiement d'un{" "}
            <strong>acompte de 30%</strong> est requis.
          </p>

          <div style={s.amountBox}>
            <span style={s.amountLabel}>Montant à régler (Acompte)</span>
            <span style={s.amountValue}>
              {depositAmount.toLocaleString()} MAD
            </span>
          </div>

          <form onSubmit={handlePay} style={s.form}>
            <div style={s.inputGroup}>
              <label style={s.label}>Numéro de Carte Bancaire</label>
              <input
                type="text"
                maxLength="16"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                style={s.input}
                required
              />
            </div>

            <div style={s.row}>
              <div style={s.inputGroup}>
                <label style={s.label}>Date d'expiration</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  style={s.input}
                  maxLength="5"
                  required
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  style={s.input}
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={processing} style={s.payBtn}>
              {processing ? (
                <span style={s.spinner}>🔄 Traitement en cours...</span>
              ) : (
                `Payer ${depositAmount.toLocaleString()} MAD`
              )}
            </button>
            <div style={s.secureNotice}>
              🔒 Vos données sont chiffrées (Simulation 256-bit)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflow: "hidden",
    animation: "slideUp 0.3s ease-out",
  },
  header: {
    background: "#fdfbf7",
    padding: "15px 25px",
    borderBottom: "1px solid #efe3d3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    color: "#5a4a3f",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#7d8c7a",
  },
  body: { padding: "25px" },
  desc: {
    color: "#5a4a3f",
    fontSize: "0.95rem",
    marginBottom: "20px",
    lineHeight: 1.5,
  },
  amountBox: {
    background: "#f9f2ec",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #efe3d3",
    textAlign: "center",
    marginBottom: "25px",
  },
  amountLabel: {
    display: "block",
    color: "#b76e4b",
    fontWeight: "500",
    marginBottom: "5px",
    fontSize: "0.9rem",
  },
  amountValue: {
    display: "block",
    color: "#b76e4b",
    fontSize: "1.8rem",
    fontWeight: "bold",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#5a4a3f" },
  input: {
    padding: "12px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s",
  },
  payBtn: {
    marginTop: "10px",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "1.05rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
  },
  spinner: { animation: "spin 1s linear infinite" },
  secureNotice: {
    textAlign: "center",
    color: "#7d8c7a",
    fontSize: "0.8rem",
    marginTop: "10px",
  },
};

export default PaymentModal;
