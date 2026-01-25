import './ClienteDashboard.css'

const ClienteDashboard = () => {
  const fotografosDestacados = [
    {
      id: 1,
      nombre: "Ana Martínez",
      especialidad: "Bodas y Eventos",
      calificacion: 4.9,
      foto: "👩‍🎨",
      portfolio: 120
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez",
      especialidad: "Retratos Artísticos",
      calificacion: 4.8,
      foto: "👨‍🎨",
      portfolio: 85
    },
    {
      id: 3,
      nombre: "María García",
      especialidad: "Moda y Producto",
      calificacion: 4.7,
      foto: "👩‍💼",
      portfolio: 95
    }
  ]

  const categorias = [
    { nombre: "Bodas", icono: "💒", count: 45 },
    { nombre: "Retratos", icono: "👨‍👩‍👧‍👦", count: 32 },
    { nombre: "Producto", icono: "📦", count: 28 },
    { nombre: "Eventos", icono: "🎉", count: 37 },
    { nombre: "Naturaleza", icono: "🌄", count: 41 },
    { nombre: "Urbano", icono: "🏙️", count: 29 }
  ]

  return (
    <div className="cliente-dashboard">
      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar fotógrafos por especialidad, ubicación..." 
            className="search-input"
          />
          <button className="search-btn cursive-font">Buscar</button>
        </div>
      </div>

      {/* Categorías */}
      <div className="categorias-section">
        <h2 className="section-title cursive-font">Explorar Categorías</h2>
        <div className="categorias-grid">
          {categorias.map((categoria, index) => (
            <div key={index} className="categoria-card">
              <span className="categoria-icon">{categoria.icono}</span>
              <h3 className="categoria-nombre">{categoria.nombre}</h3>
              <p className="categoria-count">{categoria.count} fotógrafos</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fotógrafos Destacados */}
      <div className="fotografos-section">
        <h2 className="section-title cursive-font">Fotógrafos Destacados</h2>
        <div className="fotografos-grid">
          {fotografosDestacados.map(fotografo => (
            <div key={fotografo.id} className="fotografo-card">
              <div className="fotografo-header">
                <span className="fotografo-foto">{fotografo.foto}</span>
                <div className="fotografo-info">
                  <h3 className="fotografo-nombre">{fotografo.nombre}</h3>
                  <p className="fotografo-especialidad">{fotografo.especialidad}</p>
                </div>
              </div>
              
              <div className="fotografo-stats">
                <div className="stat">
                  <span className="stat-value">{fotografo.calificacion}</span>
                  <span className="stat-label">⭐ Calificación</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{fotografo.portfolio}</span>
                  <span className="stat-label">📷 Fotos</span>
                </div>
              </div>

              <div className="fotografo-actions">
                <button className="btn-ver-portfolio cursive-font">Ver Portfolio</button>
                <button className="btn-contactar cursive-font">Contactar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos Recientes */}
      <div className="proyectos-section">
        <h2 className="section-title cursive-font">Proyectos Recientes</h2>
        <div className="proyectos-grid">
          <div className="proyecto-item">
            <div className="proyecto-image">🖼️</div>
            <div className="proyecto-info">
              <h4>Boda en la Playa</h4>
              <p>Por: Ana Martínez</p>
            </div>
          </div>
          <div className="proyecto-item">
            <div className="proyecto-image">🖼️</div>
            <div className="proyecto-info">
              <h4>Retrato Familiar</h4>
              <p>Por: Carlos Rodríguez</p>
            </div>
          </div>
          <div className="proyecto-item">
            <div className="proyecto-image">🖼️</div>
            <div className="proyecto-info">
              <h4>Session de Moda</h4>
              <p>Por: María García</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClienteDashboard