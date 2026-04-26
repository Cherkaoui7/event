import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { emoji:'🏛️', title:'Salle interactive', desc:'Disposition des tables, décoration marocaine, éclairage : visualisez en direct votre espace.' },
  { emoji:'🍲', title:'Traiteur marocain', desc:'Couscous, tajines, pastilla, pâtisseries : ajoutez les plats et le prix s\'ajuste automatiquement.' },
  { emoji:'💰', title:'Budget intelligent', desc:'Notre système vous suggère la meilleure configuration selon votre budget, en temps réel.' },
  { emoji:'📦', title:'Packs tout inclus', desc:'Mariage économique, luxe, anniversaire… choisissez un pack complet en un clic.' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.title}>DOMINATORES</h1>
        <p style={s.tagline}>La première plateforme marocaine de création d'événements sur mesure.</p>
        <p style={s.subtitle}>
          Personnalisez votre salle, choisissez votre traiteur,<br />
          simulez votre budget — le tout en quelques clics.
        </p>
        <div style={s.actions}>
          {user ? (
            <>
              <Link to="/dashboard"   style={s.primaryBtn}>Mon tableau de bord</Link>
              <Link to="/suggestions" style={s.secondaryBtn}>Suggestions intelligentes</Link>
            </>
          ) : (
            <>
              <Link to="/simulate"  style={s.primaryBtn}>Essayer la simulation</Link>
              <Link to="/register"  style={s.secondaryBtn}>Créer un compte gratuit</Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div style={s.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureEmoji}>{f.emoji}</div>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA bas */}
      {!user && (
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>Prêt à organiser votre événement ?</h2>
          <Link to="/register" style={s.primaryBtn}>Commencer maintenant →</Link>
        </div>
      )}
    </div>
  );
};

const s = {
  page:     { background:'transparent' },
  hero:     { minHeight:'85vh', display:'flex', flexDirection:'column', justifyContent:'center',
    alignItems:'center', textAlign:'center', padding:'60px 20px 40px' },
  title:    { fontSize:'clamp(2.5rem,6vw,4rem)', color:'#b76e4b', marginBottom:'10px', fontWeight:'700',
    letterSpacing:'-0.5px' },
  tagline:  { fontSize:'clamp(1rem,2.5vw,1.3rem)', color:'#5a4a3f', marginBottom:'12px', fontWeight:'500' },
  subtitle: { fontSize:'1rem', color:'#7d8c7a', lineHeight:'1.6', marginBottom:'35px', maxWidth:'500px' },
  actions:  { display:'flex', gap:'15px', flexWrap:'wrap', justifyContent:'center' },
  primaryBtn:  { background:'#b76e4b', color:'#fff', padding:'14px 30px', borderRadius:'30px',
    textDecoration:'none', fontWeight:'600', fontSize:'1rem', boxShadow:'0 4px 15px rgba(183,110,75,0.3)' },
  secondaryBtn:{ background:'#fff', color:'#b76e4b', border:'2px solid #b76e4b', padding:'14px 30px',
    borderRadius:'30px', textDecoration:'none', fontWeight:'600', fontSize:'1rem' },
  features: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'25px',
    maxWidth:'1000px', margin:'0 auto 60px', padding:'0 20px' },
  featureCard: { background:'#fff', borderRadius:'18px', padding:'28px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)',
    border:'1px solid #efe3d3', textAlign:'center' },
  featureEmoji:{ fontSize:'2.2rem', marginBottom:'12px' },
  featureTitle:{ color:'#5a4a3f', margin:'0 0 10px', fontSize:'1.05rem' },
  featureDesc: { color:'#7d8c7a', fontSize:'0.9rem', lineHeight:'1.5', margin:0 },
  cta:      { textAlign:'center', padding:'40px 20px 80px' },
  ctaTitle: { color:'#5a4a3f', marginBottom:'20px', fontSize:'1.5rem' },
};

export default Home;
