import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="main-header">
        <div className="header-container">

          <button 
            className={`menu-hamburger ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* ✅ LOGO */}
          <div className="logo-wrapper">
            <Link to="/" className="logo-link" aria-label="Ir al inicio">
              <img
                src="/assets/img/logofe.png"
                alt="Fresno Estudio"
                className="brand-logo"
              />
            </Link>
          </div>

          <div className="session-buttons">
            <Link to="/login" className="btn-login cursive-font">
              Iniciar Sesión
            </Link>

            <Link to="/register" className="btn-register cursive-font">
              Registrarse
            </Link>
          </div>

        </div>
      </header>

      <nav className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <button className="close-menu" onClick={() => setIsOpen(false)}>
            <span className="close-icon">×</span>
          </button>

          <div className="menu-header">
            <h2 className="menu-title cursive-font">Navegación</h2>
            <div className="menu-divider"></div>
          </div>

          <div className="menu-items">
            <Link to="/" className="menu-item" onClick={() => setIsOpen(false)}>
              <span className="item-text cursive-font">Inicio</span>
            </Link>

            <Link to="/contacto" className="menu-item" onClick={() => setIsOpen(false)}>
              <span className="item-text cursive-font">Contacto</span>
            </Link>
          </div>
        </div>
      </nav>

      <div 
        className={`menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />
    </>
  )
}

export default Header
