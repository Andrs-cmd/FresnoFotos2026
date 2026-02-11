import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import "./GaleriaFotografos.css";

const GaleriaFotografos = () => {
  const fotografos = [
    {
      id: 1,
      nombre: "JORGE",
      slug: "jorge",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/silueta.jpg"
    },
    {
      id: 2,
      nombre: "ZOE",
      slug: "zoe",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/zoe.jpg"
    },
    {
      id: 3,
      nombre: "GABY",
      slug: "gaby",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/gaby.jpg"
    },
    {
      id: 4,
      nombre: "AILU",
      slug: "ailu",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/ailu.jpg"
    },
    {
      id: 5,
      nombre: "BELS",
      slug: "bels",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/bels.jpg"
    },
    {
      id: 6,
      nombre: "DANI",
      slug: "dani",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/dani.jpg"
    },
    {
      id: 7,
      nombre: "DIEGO",
      slug: "diego",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/diego.jpg"
    },
    {
      id: 8,
      nombre: "KEILA",
      slug: "keila",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/keyla.jpg"
    },
    {
      id: 9,
      nombre: "ROWSI",
      slug: "rowsi",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/rocio.jpg"
    },
    {
      id: 10,
      nombre: "TRINI",
      slug: "trini",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/trini.jpg"
    },
    {
      id: 11,
      nombre: "ANDRÉS",
      slug: "andres",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/andres.jpg"
    },
    {
      id: 12,
      nombre: "CAMILA",
      slug: "camila",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/camila.jpg"
    },
    {
      id: 13,
      nombre: "BELEN",
      slug: "belen",
      especialidad: "FRESNO ESTUDIO",
      imagen: "/assets/img/silueta.jpg"
    }
  ];

  return (
    <div className="galeria-fotografos">
      <div className="galeria-grid">
        {fotografos.map((fotografo) => (
          <FotografoCard key={fotografo.id} {...fotografo} />
        ))}
      </div>
    </div>
  );
};

const FotografoCard = ({ nombre, especialidad, imagen, slug }) => {
  return (
    <div className="fotografo-card">
      <Link to={`/fotografo/${slug}`} className="card-link">
        <div className="image-container">
          <LazyLoadImage
            src={imagen}
            alt={nombre}
            className="card-image"
            effect="blur"
            width="100%"
            height="100%"
          />
          <div className="overlay">
            <div className="rayo-effect"></div>
            <h3 className="fotografo-nombre">{nombre}</h3>
            <p className="fotografo-especialidad">{especialidad}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GaleriaFotografos;
