import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [photographerFilter, setPhotographerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===============================
     OBTENER VENTAS (ADMIN)
  =============================== */
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/admin/sales");
        setSales(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Error cargando ventas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  /* ===============================
     AGRUPAR POR FOTÓGRAFO
  =============================== */
  const salesByPhotographer = useMemo(() => {
    const grouped = {};

    sales.forEach((sale) => {
      const photographer = sale.photographer;
      if (!photographer) return;

      if (!grouped[photographer._id]) {
        grouped[photographer._id] = {
          photographer,
          totalRevenue: 0,
          photos: []
        };
      }

      grouped[photographer._id].totalRevenue += sale.totalPrice || 0;

      if (Array.isArray(sale.photos)) {
        grouped[photographer._id].photos.push(
          ...sale.photos.map((p) => ({
            ...p,
            saleId: sale._id,
            saleDate: sale.createdAt
          }))
        );
      }
    });

    return Object.values(grouped);
  }, [sales]);

  /* ===============================
     FILTRO POR FOTÓGRAFO + FECHA
  =============================== */
  const filteredSales = salesByPhotographer
    .map((item) => {
      let photos = item.photos;

      if (dateFilter) {
        photos = photos.filter(
          (photo) =>
            new Date(photo.saleDate).toISOString().slice(0, 10) === dateFilter
        );
      }

      return { ...item, photos };
    })
    .filter((item) =>
      photographerFilter === "all"
        ? true
        : item.photographer._id === photographerFilter
    );

  if (loading) return <p>Cargando ventas...</p>;

  return (
    <div>
      <h1 style={{ color: "#000", marginBottom: 20 }}>
        Ventas por fotógrafo
      </h1>

      {/* FILTROS */}
      <div style={{ marginBottom: 30, display: "flex", gap: 20 }}>
        <div>
          <label style={{ marginRight: 10, fontWeight: "bold", color: "#000" }}>
            Filtrar por fotógrafo:
          </label>
          <select
            value={photographerFilter}
            onChange={(e) => setPhotographerFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          >
            <option value="all">Todos</option>
            {salesByPhotographer.map((item) => (
              <option
                key={item.photographer._id}
                value={item.photographer._id}
              >
                {item.photographer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: 10, fontWeight: "bold", color: "#000" }}>
            Filtrar por fecha:
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
      </div>

      {/* LISTADO */}
      {filteredSales.map((item) => (
        <div
          key={item.photographer._id}
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 20,
            marginBottom: 25,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15
            }}
          >
            <h3 style={{ margin: 0 }}>{item.photographer.name}</h3>
            <span style={{ color: "#000" }}>
              {item.photographer.email}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 15,
              color: "#000"
            }}
          >
            <Stat label="Fotos vendidas" value={item.photos.length} />
            <Stat
              label="Ingresos"
              value={`$${item.totalRevenue.toLocaleString("es-AR")}`}
            />
          </div>

          <div>
            <strong style={{ color: "#000" }}>Fotos vendidas:</strong>

            {item.photos.length === 0 ? (
              <p style={{ color: "#000", marginTop: 8 }}>
                No hay fotos registradas
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 12
                }}
              >
                {item.photos.map((photo, index) => {
                  if (!photo || !photo.imageUrl) return null;

                  return (
                    <div
                      key={index}
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#111"
                      }}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL.replace(
                          "/api",
                          ""
                        )}${photo.imageUrl}`}
                        alt={photo.title || "Foto vendida"}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover"
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div
    style={{
      background: "#f3f4f6",
      padding: 15,
      borderRadius: 8,
      minWidth: 140,
      textAlign: "center"
    }}
  >
    <div style={{ fontSize: 13, color: "#000" }}>{label}</div>
    <strong style={{ fontSize: 20 }}>{value}</strong>
  </div>
);

export default AdminSales;
