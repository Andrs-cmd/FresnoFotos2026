import { useRef, useEffect } from 'react'
import './Carousel.css'

const VideoHero = () => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      // 1️⃣ Acelerar la reproducción del video
      videoRef.current.playbackRate = 1.5
    }
  }, [])

  return (
    <div className="carousel video-hero">
      <video
        ref={videoRef}
        src="/video/banner-freno.mp4"  // ⚡ reemplazá por la versión optimizada si usaste FFmpeg
        autoPlay
        muted                     // ✅ necesario para autoplay en móvil
        loop
        playsInline               // ✅ autoplay seguro en iOS
        preload="auto"            // ✅ carga anticipada del video
      />

      <div className="carousel-caption">
        <h2 className="carousel-title">TU EXPERIENCIA EN FOTOS</h2>
        <p className="carousel-subtitle">CAPTURANDO LA ESENCIA DE LA VIDA</p>
      </div>
    </div>
  )
}

export default VideoHero
