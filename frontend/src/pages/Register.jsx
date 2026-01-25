import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import api from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // roles según backend
  const [role, setRole] = useState("client");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      setSuccess("Cuenta creada correctamente");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      setError(
        err.response?.data?.message || "Error al registrar usuario"
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
          width: "340px",
          background:
            "linear-gradient(135deg, #FFB347 0%, #FFD700 50%, #FF8C00 100%)",
          padding: "24px",
          borderRadius: "8px",
          color: "#fff"
        }}
      >
        <h2 style={{ marginBottom: "16px", textAlign: "center" }}>
          Registro
        </h2>

        <InputField
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        {/* Selector de rol */}
        <div style={{ marginTop: "12px" }}>
          <label style={{ fontSize: "14px", color: "#aaa" }}>
            Tipo de cuenta
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              marginTop: "6px",
              padding: "10px",
              background: "#111",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "4px"
            }}
          >
            <option value="client">Cliente</option>
            <option value="fotografo">Fotógrafo</option>
          </select>
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "#00ff88", marginTop: "10px", fontSize: "14px" }}>
            {success}
          </p>
        )}

        <button
          type="submit"
          style={{
            marginTop: "18px",
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
          Registrarse
        </button>
      </form>
    </div>
  );
}
