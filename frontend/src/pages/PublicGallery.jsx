import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

/* 💰 PRECIOS BASE */
const BASE_PRICE = 11000;

/* 🧠 FUNCIÓN DE PROMOS */
const calculatePrice = (qty) => {
  if (qty >= 20) {
    return {
      total: 132000 + (qty - 20) * 6600,
      label: "Promo paga 12 lleva 20",
      unitPrice: 6600
    };
  }

  if (qty >= 16) {
    return {
      total: 176000,
      label: "Promo paga 16 lleva todas",
      unitPrice: Math.round(176000 / qty)
    };
  }

  if (qty >= 14) {
    return {
      total: 99000 + (qty - 14) * 7071,
      label: "Promo paga 9 lleva 14",
      unitPrice: 7071
    };
  }

  if (qty >= 7) {
    return {
      total: 55000 + (qty - 7) * 7857,
      label: "Promo paga 5 lleva 7",
      unitPrice: 7857
    };
  }

  return {
    total: qty * BASE_PRICE,
    label: "Precio regular",
    unitPrice: BASE_PRICE
  };
};

export default function PublicGallery() {
  const { slug } = useParams();

  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  /* 🪟 MODAL */
  const [activePhotoId, setActivePhotoId] = useState(null);

  const formatDate = (date) =>
    new Date(date).toISOString().slice(0, 10);

  /* 🔍 CARGAR FOTOS */
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/photos/by-photographer/${slug}`);
        setPhotos(res.data);
        setFilteredPhotos(res.data);
        setSelectedPhotos([]);
      } catch (err) {
        console.error("❌ Error cargando fotos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [slug]);

  /* 📅 FILTRO POR FECHA */
  useEffect(() => {
    if (!selectedDate) {
      setFilteredPhotos(photos);
      return;
    }

    setFilteredPhotos(
      photos.filter(
        (photo) => formatDate(photo.sessionDate) === selectedDate
      )
    );
  }, [selectedDate, photos]);

  /* ✅ SELECCIÓN */
  const toggleSelect = (photoId) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const qty = selectedPhotos.length;
  const pricing = calculatePrice(qty);

  /* 🆕 REGISTRAR VENTA EN BACKEND */
  const registerSaleToDashboard = async () => {
    try {
      await api.post("/sales", {
        photographerSlug: slug,
        photoIds: selectedPhotos,
        totalPrice: pricing.total,
        promo: pricing.label,
        unitPrice: pricing.unitPrice,
        quantity: qty,
        source: "whatsapp"
      });
    } catch (error) {
      console.error("❌ Error registrando venta:", error);
    }
  };

  /* 📲 WHATSAPP */
  const sendToWhatsapp = async () => {
    if (selectedPhotos.length === 0) return;

    // 🔥 Primero guardamos la venta en el dashboard
    await registerSaleToDashboard();

    const phone = "5492215683733";
    const photoLinks = selectedPhotos
      .map(
        (id, index) =>
          `📸 Foto ${index + 1}: ${API_URL}/api/photos/preview/${id}`
      )
      .join("\n");

    const message = `
Hola! 👋
Quiero comprar fotos del fotografo *${slug.toUpperCase()}*.

📷 Cantidad: ${qty}
🏷️ Promo: ${pricing.label}
💰 Total: $${pricing.total.toLocaleString("es-AR")}

${photoLinks}

Gracias!
    `.trim();

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <p style={{ padding: 60, color: "#aaa" }}>
        Cargando galería…
      </p>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #AAC3D9 0%, #f3f3f3 50%, #fff 100%)",
        minHeight: "100vh",
        padding: 40,
        color: "#000"
      }}
    >
      {/* HEADER */}
      <h1 style={{ marginBottom: 8, letterSpacing: 1 }}>
        {slug.toUpperCase()}
      </h1>
      <p style={{ opacity: 0.6, marginBottom: 30 }}>
        Seleccioná tus fotos favoritas
      </p>

      {/* PRICE BAR */}
      <div
        style={{
          background: "#111",
          borderRadius: 14,
          padding: 20,
          marginBottom: 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20
        }}
      >
        <div style={{color: "#fff"}}>
          <strong style={{color: "#fff"}}>{qty}</strong> fotos ·{" "}
          <strong style={{color: "#fff"}}>${pricing.total.toLocaleString("es-AR")}</strong>
          {qty > 0 && (
            <div style={{ fontSize: 13, opacity: 0.6,color: "#fff" }}>
              {pricing.label} · $
              {pricing.unitPrice.toLocaleString("es-AR")} por foto
            </div>
          )}
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            background: "#000",
            color: "#fff",
            border: "1px solid #333",
            padding: "10px 14px",
            borderRadius: 10
          }}
        />
      </div>

      {/* 🖼️ GALERÍA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20
        }}
      >
        {filteredPhotos.map((photo) => {
          const isSelected = selectedPhotos.includes(photo._id);

          return (
            <div
              key={photo._id}
              onClick={() => setActivePhotoId(photo._id)}
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                cursor: "pointer",
                transform: isSelected ? "scale(0.98)" : "scale(1)",
                transition: "all .25s ease"
              }}
            >
              <img
                src={`${API_URL}${photo.thumbUrl}`}
                loading="lazy"
                alt="Foto"
                style={{
                  width: "100%",
                  height: 260,
                  objectFit: "cover",
                  filter: isSelected ? "brightness(0.7)" : "none",
                  transition: "all .3s ease"
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
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                  fontWeight: "bold",
                  zIndex: 2
                }}
              >
                {isSelected && "✓"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🪟 MODAL PREVIEW */}
      {activePhotoId && (
        <div
          onClick={() => setActivePhotoId(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
        >
          <img
            src={`${API_URL}/api/photos/preview/${activePhotoId}`}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 14
            }}
          />
        </div>
      )}

      {/* 🟢 BOTÓN COMPRAR */}
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
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,.4)",
            zIndex: 1000
          }}
        >
          Comprar {qty} · ${pricing.total.toLocaleString("es-AR")}
        </button>
      )}
    </div>
  );
}
