import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [photographerFilter, setPhotographerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===============================
     BASE URL SEGURA (PRODUCCIÓN SAFE)
  =============================== */
  const baseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "";

  /* ===============================
     OBTENER VENTAS (ADMIN)
  =============================== */
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/sales");
        const data = Array.isArray(res.data) ? res.data : [];
        setSales(data);
      } catch (err) {
        console.error("❌ Error cargando ventas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  /* DEBUG */
  useEffect(() => {
    console.log("SALES RAW:", sales);
  }, [sales]);

  /* ===============================
     AGRUPAR POR FOTÓGRAFO (SEGURO)
  =============================== */
  const salesByPhotographer = useMemo(() => {
    const grouped = {};

    sales.forEach((sale) => {
      if (!sale) return;

      const photographerData = sale.photographer;
      if (!photographerData) return;

      const photographerId =
        typeof photographerData === "string"
          ? photographerData
          : photographerData._id;

      if (!photographerId) return;

      if (!grouped[photographerId]) {
        grouped[photographerId] = {
          photographer:
            typeof photographerData === "string"
              ? { _id: photographerId, name: "Fotógrafo", email: "" }
              : photographerData,
          totalRevenue: 0,
          photos: []
        };
      }

      grouped[photographerId].totalRevenue += sale.totalPrice || 0;

      if (Array.isArray(sale.photos)) {
        sale.photos.forEach((photo) => {
          if (!photo || !photo.imageUrl) return;

          grouped[photographerId].photos.push({
            ...photo,
            saleId: sale._id,
            saleDate: sale.createdAt
          });
        });
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
            photo.saleDate &&
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
                {item.photographer.name || "Fotógrafo"}
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
      {filteredSales.length === 0 && (
        <p style={{ color: "#000" }}>No hay ventas registradas</p>
      )}

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
            <h3 style={{ margin: 0 }}>
              {item.photographer.name || "Fotógrafo"}
            </h3>
            <span style={{ color: "#000" }}>
              {item.photographer.email || ""}
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
                {item.photos.map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#111"
                    }}
                  >
                    <img
                      src={
                        photo.imageUrl
                          ? `${baseUrl}${photo.imageUrl}`
                          : ""
                      }
                      alt={photo.title || "Foto vendida"}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover"
                      }}
                    />
                  </div>
                ))}
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