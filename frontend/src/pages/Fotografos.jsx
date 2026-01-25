import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Fotografos = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/photos`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Respuesta no OK");
        }
        return res.json();
      })
      .then((data) => {
        setPhotos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ ERROR FETCH:", err);
      });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Fotos disponibles</h1>
      <p>Fotos cargadas: {photos.length}</p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap"
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo._id}
            style={{
              width: "200px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px"
            }}
          >
            <img
              src={`${API_URL}${photo.thumbUrl}`}
              alt={photo.title || "Foto"}
              style={{
                width: "100%",
                height: "140px",
                objectFit: "cover",
                borderRadius: "6px",
                marginBottom: "8px"
              }}
            />

            <h3 style={{ fontSize: "14px", margin: "6px 0" }}>
              {photo.title || "Sin título"}
            </h3>

            {photo.price > 0 && (
              <p style={{ fontWeight: "bold" }}>${photo.price}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fotografos;
