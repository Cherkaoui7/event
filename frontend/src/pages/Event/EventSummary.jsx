import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

const DECO_LABELS = { zellige:'Zellige traditionnel', traditionnel_marocain:'Marocain classique', moderne:'Moderne épuré' };
const LIGHT_LABELS = { tamise:'Ambiance tamisée', spots:'Spots design', lustres_traditionnels:'Lustres traditionnels' };
const LAYOUT_LABELS = { classique_rond:'Tables rondes', rectangulaire:'Tables rectangulaires', u_shape:'Disposition en U', cocktail:'Cocktail' };

const EventSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent]     = useState(null);
  const [room, setRoom]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get(`/events/${id}`),
      apiClient.get(`/events/${id}/room`),
    ]).then(([evRes, roomRes]) => {
      setEvent(evRes.data);
      setRoom(roomRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    if (!window.confirm('Confirmer la réservation ? Cette action est définitive.')) return;
    setConfirming(true);
    try {
      await apiClient.put(`/events/${id}`, { status: 'confirmed' });
      alert('✅ Réservation confirmée !');
      navigate('/dashboard');
    } catch { alert('Erreur'); }
    setConfirming(false);
  };

  if (loading || !event) return <div style={{ padding:'2rem' }}>Chargement...</div>;

  const caterings = event.event_caterings || [];

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>📋 Récapitulatif</h2>
        <button onClick={() => navigate(`/events/${id}/customize`)} style={s.backBtn}>← Modifier</button>
      </div>

      <div style={s.card}>
        <h3 style={s.sectionTitle}>Informations générales</h3>
        <Row label="Événement"    value={event.title} />
        <Row label="Type"         value={event.event_type} />
        <Row label="Invités"      value={`${event.guest_count} personnes`} />
        <Row label="Budget max"   value={event.budget ? `${event.budget.toLocaleString()} MAD` : 'Non défini'} />
        <Row label="Statut"       value={event.status === 'draft' ? '⏳ Brouillon' : '✅ Confirmé'} />
      </div>

      {room && (room.decoration_style || room.lighting_style || room.table_layout) && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Configuration de la salle</h3>
          {room.decoration_style && <Row label="Décoration" value={DECO_LABELS[room.decoration_style] || room.decoration_style} />}
          {room.lighting_style   && <Row label="Éclairage"  value={LIGHT_LABELS[room.lighting_style]   || room.lighting_style}   />}
          {room.table_layout     && <Row label="Disposition" value={LAYOUT_LABELS[room.table_layout]    || room.table_layout}     />}
        </div>
      )}

      {caterings.length > 0 && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Traiteur</h3>
          {caterings.map(ec => (
            <div key={ec.id} style={s.cateringRow}>
              <span>{ec.catering_item?.name}</span>
              <span style={{ color:'#7d8c7a' }}>{ec.quantity} pers.</span>
              <span style={{ fontWeight:'600', color:'#b76e4b' }}>{ec.line_total?.toLocaleString()} MAD</span>
            </div>
          ))}
        </div>
      )}

      <div style={s.totalCard}>
        <span style={s.totalLabel}>Total estimé</span>
        <strong style={s.totalValue}>{event.total_price?.toLocaleString()} MAD</strong>
      </div>

      <div style={s.actions}>
        {event.status === 'draft' && (
          <button onClick={handleConfirm} disabled={confirming} style={s.confirmBtn}>
            {confirming ? 'Confirmation...' : '✅ Confirmer la réservation'}
          </button>
        )}
        {event.status === 'confirmed' && (
          <div style={s.confirmedBox}>✅ Réservation confirmée — Merci !</div>
        )}
        <button onClick={() => navigate('/dashboard')} style={s.dashBtn}>Retour au tableau de bord</button>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5ede3' }}>
    <span style={{ color:'#7d8c7a' }}>{label}</span>
    <span style={{ fontWeight:'500', color:'#333' }}>{value}</span>
  </div>
);

const s = {
  container: { padding:'30px 40px', maxWidth:'750px', margin:'0 auto', minHeight:'100vh' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' },
  title:     { color:'#b76e4b', margin:0 },
  backBtn:   { background:'none', border:'1px solid #ddd2c2', borderRadius:'8px', padding:'8px 16px',
    color:'#5a4a3f', cursor:'pointer' },
  card:      { background:'#fff', borderRadius:'12px', padding:'20px', marginBottom:'20px',
    border:'1px solid #efe3d3', boxShadow:'0 2px 8px rgba(0,0,0,0.03)' },
  sectionTitle:{ color:'#5a4a3f', margin:'0 0 12px', fontSize:'1rem' },
  cateringRow: { display:'flex', justifyContent:'space-between', padding:'8px 0',
    borderBottom:'1px solid #f5ede3', fontSize:'0.95rem' },
  totalCard: { background:'#b76e4b', borderRadius:'12px', padding:'20px 25px', marginBottom:'20px',
    display:'flex', justifyContent:'space-between', alignItems:'center' },
  totalLabel:{ color:'rgba(255,255,255,0.85)', fontSize:'1rem' },
  totalValue:{ color:'#fff', fontSize:'1.6rem' },
  actions:   { display:'flex', flexDirection:'column', gap:'12px' },
  confirmBtn:{ padding:'14px', background:'#2e7d32', color:'#fff', border:'none', borderRadius:'10px',
    cursor:'pointer', fontWeight:'600', fontSize:'1rem' },
  confirmedBox:{ padding:'14px', background:'#e8f5e9', borderRadius:'10px', color:'#2e7d32',
    fontWeight:'600', textAlign:'center' },
  dashBtn:   { padding:'12px', background:'#f1ede6', border:'none', borderRadius:'10px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'500' },
};

export default EventSummary;
