import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import api from "../api/axios"; // 👈 CLAVE

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      // ✅ USAR AXIOS + BASEURL
      const res = await api.post("/auth/login", {
        email,
        password
      });

      const data = res.data;

      /* =====================================================
         ✅ GUARDAR TOKEN (NO SE TOCA)
      ===================================================== */
      localStorage.setItem("token", data.token);

      /* =====================================================
         ✅ GUARDAR USER (CLAVE PARA ADMINLAYOUT)
      ===================================================== */
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      /* =====================================================
         🚦 REDIRECCIÓN SEGÚN ROL
      ===================================================== */
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else if (data.user?.role === "fotografo") {
        navigate("/private");
      } else {
        navigate("/private");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo conectar con el servidor"
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #AAC3D9 0%, #f3f3f3 50%, #fff 100%)"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "320px",
          background:
            "linear-gradient(135deg, #FFB347 0%, #FFD700 50%, #FF8C00 100%)",
          padding: "24px",
          borderRadius: "8px",
          color: "#fff"
        }}
      >
        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
          Iniciar sesión
        </h2>

        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            marginTop: "15px",
            width: "100%",
            padding: "10px",
            background:
              "linear-gradient(135deg, #6A8DFF 0%, #4A6EDB 50%, #2C3E90 100%)",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
