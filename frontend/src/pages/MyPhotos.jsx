import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function MyPhotos({ refreshKey }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/photos/my");
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos, refreshKey]);

  const filteredPhotos = selectedDate
    ? photos.filter((photo) => {
        const photoDate = new Date(photo.sessionDate)
          .toISOString()
          .split("T")[0];
        return photoDate === selectedDate;
      })
    : photos;

  if (loading) return <p style={{ color: "#fff" }}>Cargando fotos...</p>;

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h2>Mis Fotos</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 8,
          borderRadius: 6
        }}
      />

      {filteredPhotos.length === 0 && <p>No hay fotos para este día</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16
        }}
      >
        {filteredPhotos.map((photo) => (
          <img
            key={photo._id}
            src={`${API_URL}${photo.thumbUrl}`}
            alt="Foto subida"
            style={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              borderRadius: 8
            }}
          />
        ))}
      </div>
    </div>
  );
}
