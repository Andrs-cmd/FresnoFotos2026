import { useState, useEffect } from "react";

const Contacto = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    fecha: "",
    mensaje: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const phone = "5492215683733";

    const text = `
Hola! 👋
Quiero hacer una consulta.

👤 Nombre: ${form.nombre}
📱 Teléfono: ${form.telefono}
📧 Email: ${form.email}
📅 Fecha de la sesión: ${form.fecha || "A confirmar"}

💬 Comentarios:
${form.mensaje}
    `.trim();

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #AAC3D9 0%, #f3f3f3 50%, #fff 100%)",
        padding: isMobile ? "40px 16px" : "60px 20px"
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          style={{
            fontSize: isMobile ? 32 : 42,
            marginBottom: 10,
            color: "#111"
          }}
        >
          Contacto
        </h1>
        <p style={{ opacity: 0.7, color: "#111" }}>
          Contanos qué necesitás y te respondemos a la brevedad
        </p>
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 30
        }}
      >
        {/* INFO */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #6A8DFF 0%, #4A6EDB 50%, #2C3E90 100%)",
            padding: isMobile ? 24 : 30,
            borderRadius: 18,
            color: "#fff"
          }}
        >
          <h2 style={{ marginBottom: 20 }}>Información de contacto</h2>

          <p style={{ marginBottom: 12 }}>
            📧 <strong>Email:</strong> tusfotosdefresnoestudio@gmail.com
          </p>

          <p style={{ marginBottom: 12 }}>
            📱 <strong>Teléfono:</strong> +54 9 221 568-3733
          </p>

          <p style={{ opacity: 0.6, marginTop: 30 }}>
            También podés escribirnos directamente por WhatsApp usando el
            formulario.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            background:
              "linear-gradient(135deg, #FFB347 0%, #FFD700 50%, #FF8C00 100%)",
            padding: isMobile ? 24 : 30,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
          }}
        >
          <h2 style={{ color: "#111" }}>Enviá tu mensaje</h2>

          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="telefono"
            placeholder="Número de celular"
            value={form.telefono}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#000" }}>
              Fecha de la sesión
            </label>

            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <textarea
            name="mensaje"
            placeholder="Comentarios o detalles del evento"
            rows={isMobile ? 3 : 4}
            value={form.mensaje}
            onChange={handleChange}
            style={textareaStyle}
          />

          <button
            type="submit"
            style={{
              marginTop: 10,
              background: "#25D366",
              color: "#000",
              border: "none",
              padding: "14px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
};

/* 🎨 INPUTS */
const inputStyle = {
  background: "#fff",
  border: "1px solid #ccc",
  color: "#111",
  padding: "12px 14px",
  borderRadius: 10,
  fontSize: 14
};

const textareaStyle = {
  ...inputStyle,
  resize: "none"
};

export default Contacto;
