import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? ""
    : import.meta.env.VITE_API_URL;

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
    if (!selectedDate) {
      setFilteredPhotos(photos);
      return;
    }

    setFilteredPhotos(
      photos.filter(
        (photo) =>
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
      const pricing = calculatePrice(selectedPhotos.length);

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

      {/* BOTON */}
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
          Comprar {qty} · ${pricing.total.toLocaleString("es-AR")}
        </button>
      )}

      {/* MODAL */}
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
            style={{
              position: "relative",
              display: "inline-block",
            }}
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

            {/* CÍRCULO DE SELECCIÓN DENTRO DE LA IMAGEN */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(activePhoto._id);
              }}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: selectedPhotos.includes(activePhoto._id)
                  ? "#00ff88"
                  : "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {selectedPhotos.includes(activePhoto._id) && "✓"}
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActivePhoto(null);
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 25,
              fontSize: 28,
              background: "none",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {/* Flechas */}
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
              fontSize: 40,
              background: "none",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ‹
          </button>

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
              fontSize: 40,
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