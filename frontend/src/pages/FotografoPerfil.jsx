import { useParams } from "react-router-dom";
import PublicGallery from "./PublicGallery";

const FotografoPerfil = () => {
  const { slug } = useParams();

  return (
    <div style={{ padding: "2rem" }}>
      {/* 🧑‍🎨 INFO DEL FOTÓGRAFO */}
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ textTransform: "uppercase", marginBottom: 8 }}>
          {slug}
        </h1>

        <p style={{ opacity: 0.7 }}>
          Galería pública del fotógrafo
        </p>
      </header>

      {/* 🖼️ GALERÍA PÚBLICA CON FILTRO POR FECHA */}
      <PublicGallery />
    </div>
  );
};

export default FotografoPerfil;
