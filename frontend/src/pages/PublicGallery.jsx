import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const API_URL = import.meta.env.MODE === 'development' ? "" : import.meta.env.VITE_API_URL;

const calculatePrice = (qty) => {
  if (qty >= 20) return { total: 132000 + (qty - 20) * 6600, label: "Promo paga 12 lleva 20", unitPrice: 6600 };
  if (qty >= 16) return { total: 176000, label: "Promo paga 16 lleva todas", unitPrice: Math.round(176000 / qty) };
  if (qty >= 14) return { total: 99000 + (qty - 14) * 7071, label: "Promo paga 9 lleva 14", unitPrice: 7071 };
  if (qty >= 7) return { total: 55000 + (qty - 7) * 7857, label: "Promo paga 5 lleva 7", unitPrice: 7857 };
  return { total: qty * 11000, label: "Precio regular", unitPrice: 11000 };
};

export default function PublicGallery() {
  const { slug } = useParams();
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(null);
  
  // Para control de gestos (swipe)
  const [touchStart, setTouchStart] = useState(null);

  const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/photos/by-photographer/${slug}`);
        setPhotos(res.data);
        setFilteredPhotos(res.data);
      } catch (err) {
        console.error("❌ Error cargando fotos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate) { setFilteredPhotos(photos); return; }
    setFilteredPhotos(photos.filter((photo) => formatDate(photo.sessionDate) === selectedDate));
  }, [selectedDate, photos]);

  // Lógica de navegación
  const navigatePhoto = (direction) => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p._id === activePhoto._id);
    let nextIndex = currentIndex + direction;
    if (nextIndex >= filteredPhotos.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  // ⌨️ Control por Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activePhoto) return;
      if (e.key === "ArrowRight") navigatePhoto(1);
      if (e.key === "ArrowLeft") navigatePhoto(-1);
      if (e.key === "Escape") setActivePhoto(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, filteredPhotos]);

  // 📱 Control por Gestos (Swipe)
  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50; // Mínimo 50px para detectar swipe
    if (isSwipe) {
      distance > 0 ? navigatePhoto(1) : navigatePhoto(-1);
    }
    setTouchStart(null);
  };

  const toggleSelect = (photoId) => {
    setSelectedPhotos((prev) => prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]);
  };

  const qty = selectedPhotos.length;
  const pricing = calculatePrice(qty);

  const sendToWhatsapp = async () => {
    if (selectedPhotos.length === 0) return;
    const FULL_DOMAIN = window.location.origin; 
    const photoLinks = selectedPhotos
      .map((id, index) => {
        const photoObj = photos.find(p => p._id === id);
        return `📸 Foto ${index + 1}: ${FULL_DOMAIN}${photoObj?.imageUrl}`;
      })
      .join("\n");

    const message = `Hola! 👋 Quiero comprar fotos de *${slug.toUpperCase()}*...\n\n${photoLinks}`;
    window.open(`https://wa.me/5492215683733?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) return <p style={{ padding: 60, color: "#aaa" }}>Cargando galería…</p>;

  return (
    <div style={{ background: "linear-gradient(135deg, #AAC3D9 0%, #f3f3f3 50%, #fff 100%)", minHeight: "100vh", padding: 40, color: "#000" }}>
      <h1>{slug.toUpperCase()}</h1>
      
      {/* BARRA DE PRECIO */}
      <div style={{ background: "#111", borderRadius: 14, padding: 20, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{color: "#fff"}}>
          <strong>{qty}</strong> fotos · <strong>${pricing.total.toLocaleString("es-AR")}</strong>
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ background: "#000", color: "#fff", border: "1px solid #333", padding: "10px 14px", borderRadius: 10 }} />
      </div>

      {/* 🖼️ GALERÍA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {filteredPhotos.map((photo) => {
          const isSelected = selectedPhotos.includes(photo._id);
          return (
            <div key={photo._id} style={{ position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
              <div onClick={() => setActivePhoto(photo)} style={{ position: "absolute", inset: 0, zIndex: 5 }} />
              <img
                src={`${API_URL}${photo.imageUrl}`} 
                alt="Foto"
                style={{ width: "100%", height: 260, objectFit: "cover", imageOrientation: "from-image" }}
              />
              <div onClick={(e) => { e.stopPropagation(); toggleSelect(photo._id); }} style={{ position: "absolute", top: 14, right: 14, width: 26, height: 26, borderRadius: "50%", background: isSelected ? "#00ff88" : "rgba(0,0,0,0.6)", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {isSelected && "✓"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🪟 MODAL MEJORADO */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)} 
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.98)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}
        >
          {/* Botones invisibles grandes en PC para navegación fácil */}
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }} style={navButtonStyle({ left: 10 })}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }} style={navButtonStyle({ right: 10 })}>›</button>

          <div style={{ position: "relative", pointerEvents: "none" }}>
            <img
              key={activePhoto._id}
              src={`${API_URL}${activePhoto.imageUrl}`}
              alt="Preview"
              style={{ 
                maxWidth: "98vw", 
                maxHeight: "95vh", 
                width: "auto",
                height: "auto",
                objectFit: "contain",
                imageOrientation: "from-image", // 🔥 FUERZA ORIENTACIÓN EXIF
                display: "block",
                boxShadow: "0 0 40px rgba(0,0,0,0.5)"
              }}
            />
          </div>
        </div>
      )}

      {qty > 0 && (
        <button onClick={sendToWhatsapp} style={{ position: "fixed", bottom: 24, right: 24, background: "#25D366", color: "#000", padding: "14px 22px", borderRadius: 999, fontWeight: 700, border: "none", zIndex: 1000 }}>
          Comprar {qty} · ${pricing.total.toLocaleString("es-AR")}
        </button>
      )}
    </div>
  );
}

const navButtonStyle = (pos) => ({
  position: "absolute",
  ...pos,
  background: "rgba(255,255,255,0.05)",
  color: "white",
  border: "none",
  width: "60px",
  height: "100px",
  fontSize: "40px",
  cursor: "pointer",
  zIndex: 10001,
  borderRadius: "8px"
});