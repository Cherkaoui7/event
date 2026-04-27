import { useState, useEffect } from "react";
import apiClient from "../../api/axios";

const CateringSection = ({ eventId, guestCount, onUpdate }) => {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get("/catering"),
      apiClient.get(`/events/${eventId}`),
    ])
      .then(([catRes, evRes]) => {
        setItems(catRes.data);
        setSelected(evRes.data.event_caterings || []);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const selectedIds = selected.map((i) => i.catering_item_id);

  const addItem = async (itemId) => {
    try {
      const res = await apiClient.post(`/events/${eventId}/catering`, {
        catering_item_id: itemId,
        quantity: guestCount,
      });
      setSelected(res.data.event_caterings || []);
      onUpdate();
    } catch {
      /* silent */
    }
  };

  const updateQty = async (itemId, qty) => {
    if (qty < 1) return;
    try {
      const res = await apiClient.put(`/events/${eventId}/catering/${itemId}`, {
        quantity: qty,
      });
      setSelected(res.data.event_caterings || []);
      onUpdate();
    } catch {
      /* silent */
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.delete(`/events/${eventId}/catering/${itemId}`);
      setSelected((prev) => prev.filter((i) => i.catering_item_id !== itemId));
      onUpdate();
    } catch {
      /* silent */
    }
  };

  if (loading) return <p>Chargement du catalogue...</p>;

  const CATEGORIES = ["entrée", "plat", "dessert"];

  return (
    <div>
      {CATEGORIES.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={s.catGroup}>
            <h4 style={s.catLabel}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}s
            </h4>
            <div style={s.grid}>
              {catItems.map((item) => {
                const sel = selected.find(
                  (si) => si.catering_item_id === item.id,
                );
                return (
                  <div key={item.id} style={s.card}>
                    <h5 style={s.itemName}>{item.name}</h5>
                    {item.description && (
                      <p style={s.desc}>{item.description}</p>
                    )}
                    <p style={s.price}>{item.price_per_person} MAD/pers.</p>
                    {!sel ? (
                      <button onClick={() => addItem(item.id)} style={s.addBtn}>
                        + Ajouter
                      </button>
                    ) : (
                      <div style={s.qtyRow}>
                        <button
                          onClick={() => updateQty(item.id, sel.quantity - 1)}
                          style={s.qtyBtn}
                        >
                          −
                        </button>
                        <span style={s.qty}>{sel.quantity} pers.</span>
                        <button
                          onClick={() => updateQty(item.id, sel.quantity + 1)}
                          style={s.qtyBtn}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={s.removeBtn}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const s = {
  catGroup: { marginBottom: "25px" },
  catLabel: {
    color: "#5a4a3f",
    borderBottom: "2px solid #efe3d3",
    paddingBottom: "5px",
    marginBottom: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
    gap: "15px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "15px",
    border: "1px solid #efe3d3",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  itemName: { margin: "0 0 6px", color: "#333", fontSize: "1rem" },
  desc: { color: "#7d8c7a", fontSize: "0.85rem", margin: "0 0 8px" },
  price: { fontWeight: "bold", color: "#b76e4b", margin: "0 0 10px" },
  addBtn: {
    background: "#b76e4b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: "500",
  },
  qtyRow: { display: "flex", alignItems: "center", gap: "8px" },
  qtyBtn: {
    background: "#f1ede6",
    border: "1px solid #ddd2c2",
    borderRadius: "6px",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  qty: { fontWeight: "600", color: "#333" },
  removeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    color: "#c0392b",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
  },
};

export default CateringSection;
