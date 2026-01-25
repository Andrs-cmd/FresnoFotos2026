import Carousel from '../components/Carousel'
import GaleriaFotografos from '../components/GaleriaFotografos'

const Inicio = () => {
  return (
    <div className="inicio-page">
      <Carousel />
      <section className="hero-section">
        <h1 className="hero-title cursive-font">Bienvenido a Fresno Estudio</h1>
        <p className="hero-subtitle">Donde la creatividad se encuentra con la perfección</p>
      </section>
      <GaleriaFotografos />
    </div>
  )
}

export default Inicio