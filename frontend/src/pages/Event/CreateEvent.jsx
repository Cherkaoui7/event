import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axios';

const EVENT_TYPES = ['mariage', 'anniversaire', 'fête', 'événement professionnel', 'autre'];

const CreateEvent = () => {
  const [form, setForm]   = useState({ title:'', event_type:'mariage', guest_count:'', budget:'' });
  const [error, setError] = useState('');
  const navigate          = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await apiClient.post('/events', {
        title:       form.title,
        event_type:  form.event_type,
        guest_count: parseInt(form.guest_count, 10) || 0,
        budget:      parseFloat(form.budget)        || null,
      });
      navigate(`/events/${res.data.id}/customize`);
    } catch { setError('Erreur lors de la création.'); }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={s.heading}>Nouvel événement</h2>
        <p style={s.sub}>Renseignez les informations de base, vous pourrez personnaliser ensuite.</p>
        {error && <p style={s.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Titre de l'événement</label>
          <input name="title" placeholder="Ex: Mariage de Fatima et Amine" value={form.title}
            onChange={handleChange} required style={s.input} />

          <label style={s.label}>Type d'événement</label>
          <select name="event_type" value={form.event_type} onChange={handleChange} style={s.input}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>

          <label style={s.label}>Nombre d'invités</label>
          <input name="guest_count" type="number" min="1" placeholder="Ex: 150"
            value={form.guest_count} onChange={handleChange} style={s.input} />

          <label style={s.label}>Budget maximum (MAD)</label>
          <input name="budget" type="number" step="100" placeholder="Ex: 50000"
            value={form.budget} onChange={handleChange} style={s.input} />

          <button type="submit" style={s.button}>Créer et personnaliser →</button>
        </form>
      </div>
    </div>
  );
};

const s = {
  container: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fdfbf7' },
  card: { background:'#fff', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'520px',
    boxShadow:'0 10px 30px rgba(0,0,0,0.05)', border:'1px solid #efe3d3' },
  heading: { color:'#b76e4b', margin:'0 0 5px' },
  sub: { color:'#7d8c7a', marginBottom:'25px', fontSize:'0.95rem' },
  form: { display:'flex', flexDirection:'column', gap:'12px' },
  label: { fontWeight:'500', color:'#5a4a3f', fontSize:'0.9rem', marginBottom:'-4px' },
  input: { padding:'12px 15px', borderRadius:'10px', border:'1px solid #ddd2c2',
    fontSize:'1rem', background:'#fcf9f5', outline:'none' },
  button: { padding:'13px', background:'#b76e4b', color:'#fff', border:'none', borderRadius:'10px',
    fontSize:'1rem', fontWeight:'600', cursor:'pointer', marginTop:'8px' },
  error: { color:'#c0392b', textAlign:'center' },
};

export default CreateEvent;
