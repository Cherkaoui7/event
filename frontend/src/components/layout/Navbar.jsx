import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>DOMINATORES</Link>
      <div style={s.links}>
        {user ? (
          <>
            <Link to="/simulator-3d" style={s.link}>Salle 3D</Link>
            <Link to="/dashboard"   style={s.link}>Mon tableau de bord</Link>
            <Link to="/suggestions" style={s.link}>Suggestions</Link>
            {user.role === 'admin' && <Link to="/admin" style={s.link}>Administration</Link>}
            <span style={s.user}>👤 {user.name}</span>
            <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
          </>
        ) : (
          <>
            <Link to="/simulator-3d" style={s.link}>Salle 3D</Link>
            <Link to="/simulate" style={s.link}>Simulation</Link>
            <Link to="/login"    style={s.link}>Connexion</Link>
            <Link to="/register" style={s.registerBtn}>Créer un compte</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const s = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 40px',
    background:'#fff', borderBottom:'1px solid #efe3d3', boxShadow:'0 2px 8px rgba(0,0,0,0.03)',
    position:'sticky', top:0, zIndex:100 },
  brand: { fontSize:'1.6rem', fontWeight:'bold', color:'#b76e4b', textDecoration:'none' },
  links: { display:'flex', alignItems:'center', gap:'20px' },
  link: { textDecoration:'none', color:'#5a4a3f', fontWeight:'500', fontSize:'0.95rem' },
  user: { color:'#7d8c7a', fontSize:'0.9rem' },
  logoutBtn: { background:'none', border:'1px solid #b76e4b', borderRadius:'8px', padding:'6px 15px',
    color:'#b76e4b', cursor:'pointer', fontWeight:'500' },
  registerBtn: { background:'#b76e4b', color:'#fff', padding:'8px 16px', borderRadius:'20px',
    textDecoration:'none', fontWeight:'600', fontSize:'0.9rem' },
};

export default Navbar;
