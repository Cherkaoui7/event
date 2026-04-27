import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';

/* ───────── colour palette ───────── */
const COLORS = ['#b76e4b', '#7d8c7a', '#d4a373', '#e9c46a', '#264653', '#2a9d8f'];
const STATUS_COLORS = { draft: '#d4a373', confirmed: '#7d8c7a', cancelled: '#c1666b' };

const MONTH_NAMES_FR = {
  '01':'Jan','02':'Fév','03':'Mar','04':'Avr','05':'Mai','06':'Juin',
  '07':'Juil','08':'Aoû','09':'Sep','10':'Oct','11':'Nov','12':'Déc',
};
const fmtMonth = (m) => {
  if (!m) return '';
  const [, mm] = m.split('-');
  return MONTH_NAMES_FR[mm] || m;
};
const fmtMAD = (v) => `${Number(v).toLocaleString('fr-FR')} MAD`;

/* ═══════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════ */
const AdminDashboard = () => {
  const [tab, setTab]         = useState('dashboard');
  const [users, setUsers]     = useState([]);
  const [events, setEvents]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);

  /* ── Fetch data based on active tab ── */
  const fetchData = useCallback(() => {
    setLoading(true);
    if (tab === 'dashboard') {
      apiClient.get('/admin/stats')
        .then(r => setStats(r.data))
        .catch(err => console.error('Stats error:', err.response?.status, err.response?.data))
        .finally(() => setLoading(false));
    } else if (tab === 'users') {
      apiClient.get('/admin/users')
        .then(r => setUsers(r.data))
        .catch(err => console.error('Users error:', err.response?.status, err.response?.data))
        .finally(() => setLoading(false));
    } else {
      apiClient.get('/admin/events')
        .then(r => setEvents(r.data))
        .catch(err => console.error('Events error:', err.response?.status, err.response?.data))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Tab button ── */
  const TabBtn = ({ id, label, icon }) => (
    <button onClick={() => setTab(id)} style={{
      ...s.tabBtn,
      background: tab === id ? '#b76e4b' : '#f1ede6',
      color: tab === id ? '#fff' : '#5a4a3f',
      transform: tab === id ? 'translateY(-2px)' : 'none',
      boxShadow: tab === id ? '0 4px 12px rgba(183,110,75,0.35)' : 'none',
    }}>
      <span style={{ marginRight: 6, fontSize: '1.1em' }}>{icon}</span>{label}
    </button>
  );

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Panneau d'administration</h2>

      <div style={s.tabs}>
        <TabBtn id="dashboard" label="Tableau de bord" icon="📊" />
        <TabBtn id="users"     label="Utilisateurs"    icon="👥" />
        <TabBtn id="events"    label="Événements"       icon="📅" />
      </div>

      {loading && <p style={s.loadingText}>Chargement…</p>}

      {/* ═══════ DASHBOARD TAB ═══════ */}
      {!loading && tab === 'dashboard' && stats && (
        <DashboardView stats={stats} />
      )}

      {/* ═══════ USERS TAB ═══════ */}
      {!loading && tab === 'users' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.thRow}>
              <th style={s.thCell}>Nom</th>
              <th style={s.thCell}>Email</th>
              <th style={s.thCell}>Rôle</th>
              <th style={s.thCell}>Inscrit le</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: u.role === 'admin' ? '#b76e4b' : '#7d8c7a' }}>
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

      {/* ═══════ EVENTS TAB ═══════ */}
      {!loading && tab === 'events' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead><tr style={s.thRow}>
              <th style={s.thCell}>Titre</th>
              <th style={s.thCell}>Client</th>
              <th style={s.thCell}>Type</th>
              <th style={s.thCell}>Statut</th>
              <th style={s.thCell}>Prix total</th>
            </tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} style={s.tr}>
                  <td style={s.td}>{ev.title}</td>
                  <td style={s.td}>{ev.user?.name}</td>
                  <td style={s.td}><span style={{ ...s.typeBadge }}>{ev.event_type}</span></td>
                  <td style={s.td}>
                    <span style={{ ...s.statusDot, background: STATUS_COLORS[ev.status] || '#999' }} />
                    {ev.status}
                  </td>
                  <td style={s.td}><strong>{Number(ev.total_price).toLocaleString('fr-FR')} MAD</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════
   DASHBOARD VIEW (Charts + KPIs)
   ═══════════════════════════════════ */
const DashboardView = ({ stats }) => {
  const { kpis, eventsByType, eventsByStatus, monthlyUsers, monthlyRevenue, topClients } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>

      {/* ── KPI Cards ── */}
      <div style={s.kpiGrid}>
        <KpiCard icon="👥" label="Utilisateurs" value={kpis.totalUsers}
          sub={`${kpis.adminCount} admins · ${kpis.clientCount} clients`} color="#b76e4b" />
        <KpiCard icon="📅" label="Événements" value={kpis.totalEvents}
          sub={`~${kpis.avgGuests} invités / événement`} color="#7d8c7a" />
        <KpiCard icon="💰" label="Revenu total" value={fmtMAD(kpis.totalRevenue)}
          sub="Toutes les réservations" color="#d4a373" />
        <KpiCard icon="📈" label="Revenu moyen" value={kpis.totalEvents ? fmtMAD(kpis.totalRevenue / kpis.totalEvents) : '0 MAD'}
          sub="Par événement" color="#264653" />
      </div>

      {/* ── Row: Events by Type + Status ── */}
      <div style={s.chartRow}>
        <ChartCard title="Événements par type">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={eventsByType} dataKey="count" nameKey="event_type"
                cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                paddingAngle={3} strokeWidth={2} stroke="#fff"
              >
                {eventsByType.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} événement(s)`} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Statut des événements">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={eventsByStatus} dataKey="count" nameKey="status"
                cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                paddingAngle={3} strokeWidth={2} stroke="#fff"
              >
                {eventsByStatus.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} événement(s)`} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row: Monthly Revenue + Monthly Registrations ── */}
      <div style={s.chartRow}>
        <ChartCard title="Revenu mensuel (MAD)">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue.map(m => ({ ...m, label: fmtMonth(m.month) }))}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b76e4b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#b76e4b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#efe3d3" />
              <XAxis dataKey="label" tick={{ fill: '#5a4a3f', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5a4a3f', fontSize: 12 }} />
              <Tooltip formatter={(v, name) => [fmtMAD(v), name === 'revenue' ? 'Revenu' : name]} />
              <Area type="monotone" dataKey="revenue" stroke="#b76e4b" strokeWidth={2.5}
                fill="url(#gradRevenue)" dot={{ r: 4, fill: '#b76e4b' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inscriptions mensuelles">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyUsers.map(m => ({ ...m, label: fmtMonth(m.month) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#efe3d3" />
              <XAxis dataKey="label" tick={{ fill: '#5a4a3f', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#5a4a3f', fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} utilisateur(s)`, 'Inscriptions']} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {monthlyUsers.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Top Clients ── */}
      <ChartCard title="Top clients par revenu">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topClients} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#efe3d3" />
            <XAxis type="number" tick={{ fill: '#5a4a3f', fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#5a4a3f', fontSize: 12 }} />
            <Tooltip formatter={(v) => [fmtMAD(v), 'Revenu']} />
            <Bar dataKey="total_revenue" radius={[0, 6, 6, 0]} barSize={28}>
              {topClients.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

/* ═══════ KPI Card ═══════ */
const KpiCard = ({ icon, label, value, sub, color }) => (
  <div style={s.kpiCard}>
    <div style={{ ...s.kpiIcon, background: color }}>{icon}</div>
    <div>
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiValue}>{value}</div>
      <div style={s.kpiSub}>{sub}</div>
    </div>
  </div>
);

/* ═══════ Chart Card Wrapper ═══════ */
const ChartCard = ({ title, children }) => (
  <div style={s.chartCard}>
    <h3 style={s.chartTitle}>{title}</h3>
    {children}
  </div>
);

/* ═══════════════════════════════════
   STYLES
   ═══════════════════════════════════ */
const s = {
  container: { padding: '40px', maxWidth: '1260px', margin: '0 auto' },
  heading: { color: '#5a4a3f', fontWeight: 700, fontSize: '1.6rem', marginBottom: 6 },
  loadingText: { color: '#8a7a6f', fontStyle: 'italic' },

  /* Tabs */
  tabs: { display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' },
  tabBtn: {
    padding: '10px 22px', border: 'none', borderRadius: '12px',
    fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
    transition: 'all .2s ease', display: 'flex', alignItems: 'center',
  },

  /* KPI grid */
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20,
  },
  kpiCard: {
    display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px',
    background: '#fff', borderRadius: 16,
    boxShadow: '0 2px 14px rgba(0,0,0,0.06)', transition: 'transform .2s',
  },
  kpiIcon: {
    width: 52, height: 52, borderRadius: 14, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
    color: '#fff', flexShrink: 0,
  },
  kpiLabel: { color: '#8a7a6f', fontSize: '0.82rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { color: '#3d322a', fontSize: '1.4rem', fontWeight: 700, marginTop: 2 },
  kpiSub: { color: '#a89a8c', fontSize: '0.78rem', marginTop: 2 },

  /* Charts */
  chartRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20,
  },
  chartCard: {
    background: '#fff', borderRadius: 16, padding: '24px',
    boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
  },
  chartTitle: { color: '#5a4a3f', fontSize: '1rem', fontWeight: 600, marginBottom: 16, marginTop: 0 },

  /* Tables */
  tableWrap: { overflowX: 'auto' },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: '14px', overflow: 'hidden',
    boxShadow: '0 2px 14px rgba(0,0,0,0.06)',
  },
  thRow: {
    background: '#fdf6f0',
  },
  thCell: {
    color: '#5a4a3f', textAlign: 'left', padding: '14px 18px',
    borderBottom: '1px solid #efe3d3', fontWeight: 600, fontSize: '0.88rem',
    textTransform: 'uppercase', letterSpacing: 0.3,
  },
  tr: { borderBottom: '1px solid #f5ede3', transition: 'background .15s' },
  td: { padding: '14px 18px', color: '#333', fontSize: '0.92rem' },
  badge: {
    color: '#fff', padding: '4px 12px', borderRadius: '20px',
    fontSize: '0.78rem', fontWeight: 600,
  },
  typeBadge: {
    background: '#f1ede6', color: '#5a4a3f', padding: '4px 12px',
    borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500,
  },
  statusDot: {
    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
    marginRight: 8, verticalAlign: 'middle',
  },
};

export default AdminDashboard;
