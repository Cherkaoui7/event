import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';
import { DECORATION_STYLES, LIGHTING_STYLES, TABLE_LAYOUTS } from '../../config/roomOptions';
import CateringSection from '../../components/event/CateringSection';
import PackSection from '../../components/event/PackSection';
import RoomPreview from '../../components/event/RoomPreview';

const CustomizeRoom = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [event, setEvent]       = useState(null);
  const [room, setRoom]         = useState({ table_layout:null, decoration_style:null, lighting_style:null });
  const [price, setPrice]       = useState(0);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState('room');
  const [confirming, setConfirming] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [evRes, roomRes] = await Promise.all([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/events/${id}/room`),
      ]);
      setEvent(evRes.data);
      setRoom({
        table_layout:     roomRes.data.table_layout,
        decoration_style: roomRes.data.decoration_style,
        lighting_style:   roomRes.data.lighting_style,
      });
      setPrice(evRes.data.total_price || 0);
    } catch { navigate('/dashboard'); }
  }, [id, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectOption = async (field, value) => {
    setRoom(prev => ({ ...prev, [field]: value }));
    setSaving(true);
    try {
      await apiClient.post(`/events/${id}/room`, { [field]: value });
      const evRes = await apiClient.get(`/events/${id}`);
      setPrice(evRes.data.total_price);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleConfirm = async () => {
    if (!window.confirm('Confirmer la réservation ?')) return;
    setConfirming(true);
    try {
      await apiClient.put(`/events/${id}`, { status: 'confirmed' });
      alert('Réservation confirmée !');
      fetchAll();
    } catch { alert('Erreur lors de la confirmation.'); }
    setConfirming(false);
  };

  const renderSelector = (options, currentValue, field) => (
    <div style={s.optionGrid}>
      {options.map(opt => (
        <div key={opt.id} onClick={() => selectOption(field, opt.id)}
          style={{ ...s.optionCard,
            borderColor: currentValue === opt.id ? '#b76e4b' : '#efe3d3',
            background:  currentValue === opt.id ? '#f9f2ec' : '#fff',
          }}>
          <div style={s.optionEmoji}>{opt.emoji}</div>
          <div style={s.optionLabel}>{opt.label}</div>
          <div style={s.optionPrice}>{opt.price.toLocaleString()} MAD</div>
        </div>
      ))}
    </div>
  );

  const TABS = [
    { id:'room',     label:'🏛️ Salle'    },
    { id:'catering', label:'🍲 Traiteur'  },
    { id:'pack',     label:'📦 Packs'     },
  ];

  if (!event) return <div style={{ padding:'2rem' }}>Chargement...</div>;

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>{event.title}</h2>
          <p style={s.subtitle}>{event.event_type} · {event.guest_count} invités</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Retour</button>
      </div>

      {/* Onglets */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            ...s.tab,
            background: activeTab === t.id ? '#b76e4b' : '#f1ede6',
            color:      activeTab === t.id ? '#fff' : '#5a4a3f',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Onglet Salle */}
      {activeTab === 'room' && (
        <>
          <section style={s.section}>
            <h3>Disposition des tables</h3>
            {renderSelector(TABLE_LAYOUTS, room.table_layout, 'table_layout')}
          </section>
          <section style={s.section}>
            <h3>Style de décoration</h3>
            {renderSelector(DECORATION_STYLES, room.decoration_style, 'decoration_style')}
          </section>
          <section style={s.section}>
            <h3>Éclairage</h3>
            {renderSelector(LIGHTING_STYLES, room.lighting_style, 'lighting_style')}
          </section>
          <RoomPreview layout={room.table_layout} />
        </>
      )}

      {/* Onglet Traiteur */}
      {activeTab === 'catering' && (
        <section style={s.section}>
          <h3>Sélectionnez vos plats</h3>
          <CateringSection
            eventId={id}
            guestCount={event.guest_count}
            onUpdate={() => apiClient.get(`/events/${id}`).then(r => setPrice(r.data.total_price))}
          />
        </section>
      )}

      {/* Onglet Packs */}
      {activeTab === 'pack' && (
        <section style={s.section}>
          <h3>Choisissez un pack tout inclus</h3>
          <PackSection eventId={id} onApply={fetchAll} />
        </section>
      )}

      {/* Barre de prix */}
      <div style={s.priceBar}>
        <div>
          <span style={s.priceLabel}>Prix total estimé</span>
          {saving && <span style={s.savingTxt}> · Enregistrement...</span>}
        </div>
        <strong style={s.priceVal}>{price.toLocaleString()} MAD</strong>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button onClick={() => navigate(`/events/${id}/summary`)} style={s.summaryBtn}>
          Voir le récapitulatif
        </button>
        {event.status === 'draft' && (
          <button onClick={handleConfirm} disabled={confirming} style={s.confirmBtn}>
            {confirming ? 'Confirmation...' : '✅ Confirmer la réservation'}
          </button>
        )}
        {event.status === 'confirmed' && (
          <span style={s.confirmedBadge}>✅ Réservation confirmée</span>
        )}
      </div>
    </div>
  );
};

const s = {
  container: { padding:'30px 40px', maxWidth:'950px', margin:'0 auto', minHeight:'100vh' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' },
  title:     { color:'#b76e4b', margin:0, fontSize:'1.6rem' },
  subtitle:  { color:'#7d8c7a', margin:'4px 0 0', fontSize:'0.9rem' },
  backBtn:   { background:'none', border:'1px solid #ddd2c2', borderRadius:'8px', padding:'8px 16px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'500' },
  tabs:      { display:'flex', gap:'10px', marginBottom:'25px' },
  tab:       { padding:'10px 20px', border:'none', borderRadius:'10px', fontWeight:'600',
    cursor:'pointer', transition:'all 0.2s', fontSize:'0.95rem' },
  section:   { marginBottom:'30px' },
  optionGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'15px' },
  optionCard:{ padding:'20px', borderRadius:'12px', border:'2px solid #efe3d3', cursor:'pointer',
    textAlign:'center', transition:'all 0.2s', boxShadow:'0 2px 8px rgba(0,0,0,0.03)' },
  optionEmoji:{ fontSize:'1.8rem', marginBottom:'8px' },
  optionLabel:{ fontWeight:'600', marginBottom:'6px', color:'#333' },
  optionPrice:{ color:'#b76e4b', fontWeight:'500', fontSize:'0.95rem' },
  priceBar:  { marginTop:'30px', padding:'20px 25px', background:'#fff', borderRadius:'12px',
    border:'1px solid #efe3d3', display:'flex', justifyContent:'space-between', alignItems:'center',
    boxShadow:'0 2px 10px rgba(0,0,0,0.04)' },
  priceLabel:{ color:'#5a4a3f', fontWeight:'500' },
  savingTxt: { color:'#7d8c7a', fontSize:'0.85rem' },
  priceVal:  { color:'#b76e4b', fontSize:'1.4rem' },
  actions:   { display:'flex', gap:'15px', marginTop:'20px', flexWrap:'wrap' },
  summaryBtn:{ padding:'12px 25px', background:'#f1ede6', border:'none', borderRadius:'10px',
    color:'#5a4a3f', cursor:'pointer', fontWeight:'600' },
  confirmBtn:{ padding:'12px 25px', background:'#2e7d32', color:'#fff', border:'none', borderRadius:'10px',
    cursor:'pointer', fontWeight:'600' },
  confirmedBadge:{ padding:'12px 20px', background:'#e8f5e9', borderRadius:'10px',
    color:'#2e7d32', fontWeight:'600' },
};

export default CustomizeRoom;
