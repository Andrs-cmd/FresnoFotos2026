import { useState } from "react";
import api from "../api/axios";

export default function UploadPhotos({ onUpload }) {
  const [images, setImages] = useState([]);
  const [sessionDate, setSessionDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!images || images.length === 0) {
      setMessage("Selecciona al menos una imagen");
      return;
    }

    if (!sessionDate) {
      setMessage("Selecciona la fecha de la sesión");
      return;
    }

    const formData = new FormData();

    // 📸 múltiples imágenes
    images.forEach((file) => {
      formData.append("images", file); // 👈 CLAVE
    });

    // 📅 fecha de sesión (YYYY-MM-DD)
    formData.append("sessionDate", sessionDate);

    try {
      setLoading(true);

      await api.post("/photos", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setMessage(`📸 ${images.length} fotos subidas correctamente`);
      setImages([]);
      setSessionDate("");
      e.target.reset();

      if (onUpload) onUpload();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Error al subir las imágenes"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        color: "#fff",
        background: "#1a1a1a",
        padding: 20,
        borderRadius: 8
      }}
    >
      <h2>Subir Fotos</h2>

      <form onSubmit={handleSubmit}>
        {/* 📅 Fecha de la sesión */}
        <label style={{ display: "block", marginBottom: 6 }}>
          Fecha de la sesión
        </label>

        <input
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          style={{ marginBottom: 16, width: "100%" }}
          required
        />

        {/* 🖼️ Imágenes múltiples */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files))}
          style={{ marginBottom: 16 }}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Subir fotos"}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
