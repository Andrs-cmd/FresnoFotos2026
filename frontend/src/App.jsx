import { Routes, Route } from "react-router-dom";

/* Layout */
import Header from "./components/Header";
import Footer from "./components/Footer";

/* Pages públicas */
import Inicio from "./pages/Inicio";
import Fotografos from "./pages/Fotografos";
import Clientes from "./pages/Clientes";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FotografoPerfil from "./pages/FotografoPerfil";

/* Pages privadas */
import Private from "./pages/Private";
import UploadPhoto from "./pages/UploadPhoto";

/* Admin */
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";

/* Auth */
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Routes>
          {/* 🌍 Rutas públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/fotografos" element={<Fotografos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* 🔐 Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 📸 Perfil público del fotógrafo + galería */}
          <Route path="/fotografo/:slug" element={<FotografoPerfil />} />

          {/* 🔒 Área privada fotógrafo */}
          <Route
            path="/private"
            element={
              <PrivateRoute>
                <Private />
              </PrivateRoute>
            }
          />

          {/* 🔒 Subir fotos */}
          <Route
            path="/subir-foto"
            element={
              <PrivateRoute>
                <UploadPhoto />
              </PrivateRoute>
            }
          />

          {/* 🛡️ PANEL ADMIN */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
