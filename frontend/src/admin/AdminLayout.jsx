import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
// luego podrás crear estos:
// import AdminPhotos from "./AdminPhotos";
import AdminSales from "./AdminSales";

const AdminLayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [section, setSection] = useState("dashboard");

  // 🔐 Protección básica
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (user.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", marginTop: 80 }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          background: "#1b1f24",
          color: "#fff",
          padding: 20
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button style={linkStyle(section === "dashboard")} onClick={() => setSection("dashboard")}>
            Dashboard
          </button>

          <button style={linkStyle(section === "fotos")} onClick={() => setSection("fotos")}>
            Fotos
          </button>

          <button style={linkStyle(section === "ventas")} onClick={() => setSection("ventas")}>
            Ventas
          </button>

          <button style={linkStyle(section === "fotografos")} onClick={() => setSection("fotografos")}>
            Fotógrafos
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, padding: 30, background: "#f3f4f6" }}>
        {section === "dashboard" && <AdminDashboard />}
        {section === "ventas" && <AdminSales />}
        {/* luego puedes añadir */}
        {/* section === "fotos" && <AdminPhotos /> */}
      </main>
    </div>
  );
};

const linkStyle = (active) => ({
  color: "#fff",
  background: active ? "#2f3542" : "transparent",
  border: "none",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 6,
  cursor: "pointer",
  opacity: active ? 1 : 0.7,
  fontSize: 14
});

export default AdminLayout;
