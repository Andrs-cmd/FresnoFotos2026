import { useRef, useEffect } from 'react'
import './Carousel.css'

const VideoHero = () => {
  const videoRef = useRef(null)

  // Cambia esta URL por la que te dé tu servicio de hosting de video
  const VIDEO_EXTERNAL_URL = "https://res.cloudinary.com/dbykszfsz/video/upload/v1770433033/banner-freno_ubc9gi.mp4"

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
        src={VIDEO_EXTERNAL_URL} // 🔗 Usando la URL externa
        autoPlay
        muted             
        loop
        playsInline       
        preload="metadata" // ⚡ Cambiado a "metadata" para no gastar datos del usuario innecesariamente
      />

      <div className="carousel-caption">
        <h2 className="carousel-title">TU EXPERIENCIA EN FOTOS</h2>
        <p className="carousel-subtitle">CAPTURANDO LA ESENCIA DE LA VIDA</p>
      </div>
    </div>
  )
}

export default VideoHero