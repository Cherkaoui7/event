import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

const AdminDashboard = () => {
  const [tab, setTab]       = useState('users');
  const [users, setUsers]   = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = tab === 'users' ? '/admin/users' : '/admin/events';
    apiClient.get(url)
      .then(r => tab === 'users' ? setUsers(r.data) : setEvents(r.data))
      .catch(err => console.error('Admin API error:', err.response?.status, err.response?.data))
      .finally(() => setLoading(false));
  }, [tab]);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      ...s.tabBtn, background: tab === id ? '#b76e4b' : '#f1ede6',
      color: tab === id ? '#fff' : '#5a4a3f',
    }}>{label}</button>
  );

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Panneau d'administration</h2>
      <div style={s.tabs}>
        <TabBtn id="users"  label="👥 Utilisateurs" />
        <TabBtn id="events" label="📅 Événements"    />
      </div>

      {loading && <p>Chargement...</p>}

      {!loading && tab === 'users' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.th}>
              <th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: u.role==='admin'?'#b76e4b':'#7d8c7a' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={s.td}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'events' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.th}>
              <th>Titre</th><th>Client</th><th>Type</th><th>Statut</th><th>Prix total</th>
            </tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={s.tr}>
                  <td style={s.td}>{ev.title}</td>
                  <td style={s.td}>{ev.user?.name}</td>
                  <td style={s.td}>{ev.event_type}</td>
                  <td style={s.td}>{ev.status}</td>
                  <td style={s.td}><strong>{ev.total_price} MAD</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const s = {
  container: { padding:'40px', maxWidth:'1200px', margin:'0 auto' },
  heading: { color:'#5a4a3f' },
  tabs: { display:'flex', gap:'10px', marginBottom:'25px' },
  tabBtn: { padding:'10px 20px', border:'none', borderRadius:'10px', fontWeight:'600', cursor:'pointer' },
  tableWrap: { overflowX:'auto' },
  table: { width:'100%', borderCollapse:'collapse', background:'#fff',
    borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' },
  th: { background:'#fdf6f0', color:'#5a4a3f', textAlign:'left', padding:'12px 16px',
    borderBottom:'1px solid #efe3d3' },
  tr: { borderBottom:'1px solid #f5ede3' },
  td: { padding:'12px 16px', color:'#333' },
  badge: { color:'#fff', padding:'3px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600' },
};

export default AdminDashboard;
