const RoomPreview = ({ layout }) => {
  const renderLayout = () => {
    if (!layout) return <p style={{ color:'#7d8c7a' }}>Aucune disposition sélectionnée</p>;

    switch (layout) {
      case 'classique_rond':
        return (
          <div style={s.area}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ ...s.table, borderRadius:'50%', width:'65px', height:'65px' }}>
                T{i+1}
              </div>
            ))}
          </div>
        );
      case 'rectangulaire':
        return (
          <div style={s.areaCol}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...s.table, width:'130px', height:'38px' }}>Table {i+1}</div>
            ))}
          </div>
        );
      case 'u_shape':
        return (
          <div style={{ textAlign:'center' }}>
            <div style={{ ...s.table, width:'220px', height:'40px', margin:'0 auto 15px' }}>
              Table d'honneur
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:'12px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {['A','B','C'].map(l => <div key={l} style={{ ...s.table, width:'80px', height:'38px' }}>{l}</div>)}
              </div>
              <div style={{ width:'60px' }}></div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {['D','E','F'].map(l => <div key={l} style={{ ...s.table, width:'80px', height:'38px' }}>{l}</div>)}
              </div>
            </div>
          </div>
        );
      case 'cocktail':
        return (
          <div style={s.area}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ ...s.table, borderRadius:'40%', width:'42px', height:'42px', fontSize:'0.7rem' }}>
                G{i+1}
              </div>
            ))}
          </div>
        );
      default:
        return <p>Disposition inconnue</p>;
    }
  };

  return (
    <div style={s.container}>
      <h3 style={s.heading}>Aperçu de la salle</h3>
      <div style={s.preview}>{renderLayout()}</div>
    </div>
  );
};

const s = {
  container: { marginTop:'20px', padding:'20px', background:'#fcf9f5', borderRadius:'12px',
    border:'1px solid #efe3d3' },
  heading:   { color:'#5a4a3f', margin:'0 0 15px' },
  preview:   { minHeight:'160px', display:'flex', alignItems:'center', justifyContent:'center', padding:'10px' },
  area:      { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'15px', alignItems:'center' },
  areaCol:   { display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' },
  table:     { background:'#b76e4b', color:'#fff', display:'flex', alignItems:'center',
    justifyContent:'center', fontSize:'0.8rem', fontWeight:'bold',
    boxShadow:'0 2px 6px rgba(183,110,75,0.3)' },
};

export default RoomPreview;
