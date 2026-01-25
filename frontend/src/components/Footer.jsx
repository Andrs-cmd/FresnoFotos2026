import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* ======================
             SECCIÓN MARCA
        ====================== */}
        <div className="footer-section brand">
          <h3 className="cursive-font">Fresno Estudio</h3>
          <p>Donde la creatividad se encuentra con la perfección</p>
        </div>

        {/* ======================
             SECCIÓN ENLACES
        ====================== */}
        <div className="footer-section links">
          <h4 className="cursive-font">Enlaces Rápidos</h4>
          <div className="footer-links">
            <a href="#inicio" className="footer-link">Inicio</a>
            <a href="#contacto" className="footer-link">Contacto</a>
          </div>
        </div>

        {/* ======================
             SECCIÓN CONTACTO
        ====================== */}
        <div className="footer-section contact">
          <h4 className="cursive-font">Contacto</h4>
          <p>📧 <a href="mailto:tusfotosdefresnoestudio@gmail.com" className="footer-link">
            tusfotosdefresnoestudio@gmail.com
          </a></p>
          <p>📞 <a href="tel:+5492215683733" className="footer-link">
            +54 9221 568-3733
          </a></p>
          <p>📍 Las Grutas, Río Negro - Patagonia</p>
        </div>
      </div>

      {/* ======================
           FOOTER BOTTOM
      ====================== */}
      <div className="footer-bottom">
        <p>
          &copy; 2024 Fresno Estudio. Todos los derechos reservados.  
          Desarrollada por <a href="https://andrs-cmd.github.io/Andrs-cmd.githup.io/#" target="_blank" rel="noopener noreferrer" className="dev-link">Andres-prada</a>.
        </p>
      </div>
    </footer>
  )
}

export default Footer
