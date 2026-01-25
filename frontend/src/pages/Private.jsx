import { useState } from "react";
import UploadPhoto from "./UploadPhoto";
import MyPhotos from "./MyPhotos";

export default function Private() {
  // 🔁 sirve para refrescar la galería al subir una foto
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: 20,
        color: "#fff"
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Panel del Fotógrafo</h2>

      {/* 📤 Subida de fotos */}
      <UploadPhoto onUpload={() => setRefreshKey((k) => k + 1)} />

      {/* 📸 Galería privada */}
      <MyPhotos refreshKey={refreshKey} />
    </div>
  );
}
