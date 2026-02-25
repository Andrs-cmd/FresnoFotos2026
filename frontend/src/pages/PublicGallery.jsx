import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_API_URL || "";

const calculatePrice = (qty) => {
  return {
    total: qty * 10000,
    label: "Precio regular",
    unitPrice: 10000,
  };
};

export default function PublicGallery() {
  const { slug } = useParams();
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(null);
  const [touchStart, setTouchStart] = useState(null);

  const formatDate = (date) =>
    new Date(date).toISOString().slice(0, 10);

  /* ===============================
     OBTENER FOTOS
  =============================== */
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

  /* ===============================
     OBTENER FECHAS ÚNICAS
  =============================== */
  const availableDates = useMemo(() => {
    const unique = new Set(
      photos
        .filter((p) => p.sessionDate)
        .map((p) => formatDate(p.sessionDate))
    );
    return Array.from(unique).sort();
  }, [photos]);

  /* ===============================
     FILTRAR POR FECHA
  =============================== */
  useEffect(() => {
    if (!selectedDate) {
      setFilteredPhotos(photos);
      return;
    }

    setFilteredPhotos(
      photos.filter(
        (photo) =>
          photo.sessionDate &&
          formatDate(photo.sessionDate) === selectedDate
      )
    );
  }, [selectedDate, photos]);

  const navigatePhoto = (direction) => {
    if (!activePhoto) return;

    const currentIndex = filteredPhotos.findIndex(
      (p) => p._id === activePhoto._id
    );

    let nextIndex = currentIndex + direction;

    if (nextIndex >= filteredPhotos.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;

    setActivePhoto(filteredPhotos[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activePhoto) return;

      if (e.key === "ArrowRight") navigatePhoto(1);
      if (e.key === "ArrowLeft") navigatePhoto(-1);
      if (e.key === "Escape") setActivePhoto(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [activePhoto, filteredPhotos]);

  const onTouchStart = (e) =>
    setTouchStart(e.targetTouches[0].clientX);

  const onTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) > 50) {
      distance > 0 ? navigatePhoto(1) : navigatePhoto(-1);
    }

    setTouchStart(null);
  };

  const toggleSelect = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const qty = selectedPhotos.length;
  const pricing = calculatePrice(qty);

  const sendToWhatsapp = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      await api.post("/sales", {
        photographerSlug: slug,
        photoIds: selectedPhotos,
        promo: pricing.label,
        unitPrice: pricing.unitPrice,
        source: "web",
      });

      const FULL_DOMAIN = window.location.origin;

      const photoLinks = selectedPhotos
        .map((id, index) => {
          const photoObj = photos.find((p) => p._id === id);
          return `📸 Foto ${index + 1}: ${FULL_DOMAIN}${photoObj?.imageUrl}`;
        })
        .join("\n");

      const message = `Hola! 👋 Quiero comprar fotos de *${slug.toUpperCase()}*:\n\n${photoLinks}`;

      window.open(
        `https://wa.me/5492215683733?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      setSelectedPhotos([]);
    } catch (error) {
      console.error("❌ Error registrando venta:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "Hubo un error registrando la venta"
      );
    }
  };

  if (loading)
    return (
      <p style={{ padding: 60, color: "#aaa" }}>
        Cargando galería…
      </p>
    );

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #AAC3D9 0%, #f3f3f3 50%, #fff 100%)",
        minHeight: "100vh",
        padding: 40,
        color: "#000",
      }}
    >
      <h1>{slug.toUpperCase()}</h1>

      {/* SELECTOR DE FECHA */}
      {availableDates.length > 0 && (
  <div style={{ marginBottom: 30 }}>
    <label
      style={{
        fontWeight: 600,
        marginRight: 12,
      }}
    >
      Filtrar por fecha:
    </label>

    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      min={availableDates[0]}
      max={availableDates[availableDates.length - 1]}
      style={{
        padding: 8,
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 14,
      }}
    />

    {selectedDate && (
      <button
        onClick={() => setSelectedDate("")}
        style={{
          marginLeft: 10,
          padding: "6px 10px",
          borderRadius: 8,
          border: "none",
          background: "#ddd",
          cursor: "pointer",
        }}
      >
        Limpiar
      </button>
    )}
  </div>
)}

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {filteredPhotos.map((photo) => {
          const isSelected =
            selectedPhotos.includes(photo._id);

          return (
            <div
              key={photo._id}
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => setActivePhoto(photo)}
            >
              <img
                src={`${API_URL}${photo.imageUrl}`}
                alt="Foto"
                style={{
                  width: "100%",
                  height: 260,
                  objectFit: "cover",
                }}
              />

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(photo._id);
                }}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isSelected
                    ? "#00ff88"
                    : "rgba(0,0,0,0.6)",
                  zIndex: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isSelected && "✓"}
              </div>
            </div>
          );
        })}
      </div>

      {/* PANEL FIJO DE SELECCIÓN */}
      {qty > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            background: "#1336e7",
            padding: "14px 20px",
            borderRadius: 16,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          <div style={{ fontWeight: 700, color: "#fff" }}>
            {qty} fotos seleccionadas
          </div>
          <div style={{ marginTop: 6, color: "#fff" }}>
            Total: ${pricing.total.toLocaleString("es-AR")}
          </div>
        </div>
      )}

      {/* BOTON WHATSAPP */}
      {qty > 0 && (
        <button
          onClick={sendToWhatsapp}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#25D366",
            color: "#000",
            padding: "14px 22px",
            borderRadius: 999,
            fontWeight: 700,
            border: "none",
            zIndex: 1000,
          }}
        >
          Comprar
        </button>
      )}

      {/* MODAL (NO TOCADO) */}
      {/* MODAL COMPLETO */}
{activePhoto && (
  <div
    onClick={() => setActivePhoto(null)}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.92)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{ position: "relative" }}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={`${API_URL}${activePhoto.imageUrl}`}
        alt="Foto ampliada"
        style={{
          maxWidth: "95vw",
          maxHeight: "85vh",
          objectFit: "contain",
          borderRadius: 12,
        }}
      />

      {/* CÍRCULO DE SELECCIÓN */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleSelect(activePhoto._id);
        }}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: selectedPhotos.includes(activePhoto._id)
            ? "#00ff88"
            : "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {selectedPhotos.includes(activePhoto._id) && "✓"}
      </div>
    </div>

    {/* BOTÓN CERRAR */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setActivePhoto(null);
      }}
      style={{
        position: "absolute",
        top: 20,
        right: 25,
        fontSize: 30,
        background: "none",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      ✕
    </button>

    {/* FLECHA IZQUIERDA */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigatePhoto(-1);
      }}
      style={{
        position: "absolute",
        left: 20,
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: 50,
        background: "none",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      ‹
    </button>

    {/* FLECHA DERECHA */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigatePhoto(1);
      }}
      style={{
        position: "absolute",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: 50,
        background: "none",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      ›
    </button>
  </div>
)}
    </div>
  );
}