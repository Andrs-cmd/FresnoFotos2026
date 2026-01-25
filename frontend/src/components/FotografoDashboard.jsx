import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const FotografoDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/photos/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando fotos");
        return res.json();
      })
      .then((data) => {
        setPhotos(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("❌ Error:", err));
  }, [token]);

  return (
    <div style={{ padding: 30 }}>
      <h2>Mis fotos</h2>

      {photos.length === 0 && <p>No tienes fotos subidas</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
          gap: 16,
          marginTop: 20
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 10,
              background: "#fff"
            }}
          >
            <img
              src={`${API_URL}${photo.thumbUrl}`}
              alt={photo.title || "Foto"}
              style={{
                width: "100%",
                height: 140,
                objectFit: "cover",
                borderRadius: 6,
                marginBottom: 8
              }}
            />

            <h4 style={{ margin: "6px 0" }}>
              {photo.title || "Sin título"}
            </h4>

            {photo.price > 0 && (
              <p style={{ fontWeight: "bold" }}>${photo.price}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FotografoDashboard;
