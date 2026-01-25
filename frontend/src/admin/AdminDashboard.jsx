import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [photographerFilter, setPhotographerFilter] = useState("all");

  /* ===============================
     OBTENER ESTADÍSTICAS
  =============================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("❌ Error cargando dashboard:", err);
      }
    };

    fetchStats();
  }, []);

  /* ===============================
     OBTENER FOTOS
  =============================== */
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await api.get("/admin/photos");
        setPhotos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Error cargando fotos:", err);
      }
    };

    fetchPhotos();
  }, []);

  /* ===============================
     CARGAR PREVIEWS PROTEGIDOS
  =============================== */
  useEffect(() => {
    photos.forEach(async (photo) => {
      if (photoUrls[photo._id]) return;

      try {
        const res = await api.get(
          `/admin/photos/${photo._id}/original`,
          { responseType: "blob" }
        );

        const url = URL.createObjectURL(res.data);
        setPhotoUrls((prev) => ({ ...prev, [photo._id]: url }));
      } catch (err) {
        console.error("❌ Error cargando preview:", err);
      }
    });

    return () => {
      Object.values(photoUrls).forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [photos]);

  /* ===============================
     DESCARGAR ORIGINAL
  =============================== */
  const handleDownloadPhoto = async (photo) => {
    try {
      const res = await api.get(
        `/admin/photos/${photo._id}/original`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);

      const a = document.createElement("a");
      a.href = url;
      a.download = photo.title || "foto-original.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al descargar la imagen");
    }
  };

  /* ===============================
     ELIMINAR FOTO
  =============================== */
  const handleDeletePhoto = async (id) => {
    if (!confirm("¿Eliminar foto?")) return;

    try {
      await api.delete(`/admin/photos/${id}`);
      setPhotos((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Error eliminando la foto");
    }
  };

  /* ===============================
     AGRUPAR POR FOTÓGRAFO
  =============================== */
  const photosByPhotographer = useMemo(() => {
    const map = {};

    photos.forEach((p) => {
      if (!p.photographer) return;

      map[p.photographer._id] ??= {
        photographer: p.photographer,
        photos: []
      };

      map[p.photographer._id].photos.push(p);
    });

    return Object.values(map);
  }, [photos]);

  const filtered = photosByPhotographer.filter(
    (g) =>
      photographerFilter === "all" ||
      g.photographer._id === photographerFilter
  );

  if (!stats) return <p>Cargando...</p>;

  return (
    <div
      style={{
        padding: 30,
        background: "#f5f5f5",
        minHeight: "100vh",
        color: "#000"
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Dashboard Admin</h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <StatCard title="Ventas" value={stats.totalSales} />
        <StatCard title="Fotos" value={stats.totalPhotos} />
        <StatCard
          title="Ingresos"
          value={`$${stats.totalRevenue}`}
        />
      </div>

      <select
        value={photographerFilter}
        onChange={(e) => setPhotographerFilter(e.target.value)}
        style={{ padding: 8, marginBottom: 20 }}
      >
        <option value="all">Todos</option>
        {photosByPhotographer.map((g) => (
          <option
            key={g.photographer._id}
            value={g.photographer._id}
          >
            {g.photographer.name}
          </option>
        ))}
      </select>

      {filtered.map((group) => (
        <div
          key={group.photographer._id}
          style={{ marginBottom: 40 }}
        >
          <h3>{group.photographer.name}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(200px,1fr))",
              gap: 15
            }}
          >
            {group.photos.map((photo) => (
              <div
                key={photo._id}
                style={{
                  background: "#fff",
                  padding: 10,
                  borderRadius: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
              >
                {photoUrls[photo._id] ? (
                  <img
                    src={photoUrls[photo._id]}
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      marginBottom: 8
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 150,
                      background: "#ddd",
                      borderRadius: 6
                    }}
                  />
                )}

                <p style={{ fontWeight: "bold" }}>
                  {photo.title}
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleDownloadPhoto(photo)}
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() =>
                      handleDeletePhoto(photo._id)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div
    style={{
      padding: 20,
      background: "#222",
      color: "#fff",
      borderRadius: 8,
      minWidth: 160,
      textAlign: "center"
    }}
  >
    <h4>{title}</h4>
    <strong style={{ fontSize: 20 }}>{value}</strong>
  </div>
);

export default AdminDashboard;
