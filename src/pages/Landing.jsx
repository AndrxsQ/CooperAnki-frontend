import { useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

const successStories = [
  {
    title: "Historias de impacto",
    description: "Conoce iniciativas que contribuyen al desarrollo de las comunidades.",
  },
  {
    title: "Alianzas que transforman",
    description: "La cooperación abre caminos para construir soluciones compartidas.",
  },
  {
    title: "Resultados sostenibles",
    description: "Descubre experiencias orientadas a un futuro más equitativo.",
  },
];

const projectsInProgress = [
  {
    title: "Ideas que se convierten en proyectos",
    description: "Explora iniciativas que buscan oportunidades de cooperación.",
  },
  {
    title: "Conectando oportunidades",
    description: "Encuentra convocatorias para impulsar proyectos de impacto.",
  },
  {
    title: "Cooperación en acción",
    description: "Conoce el trabajo que promueve el desarrollo sostenible.",
  },
];

const ShowcaseCard = ({ item, index, section }) => (
  <article className="showcase-card">
    <span className="showcase-card-number" aria-hidden="true">
      {String(index + 1).padStart(2, "0")}
    </span>
    <div>
      <p className="showcase-card-eyebrow">{section}</p>
      <h3>{item.title}</h3>
      <p className="showcase-card-description">{item.description}</p>
    </div>
    <span className="showcase-card-arrow" aria-hidden="true">↗</span>
  </article>
);

const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`landing-page${isDark ? " is-dark" : ""}`}>
      <Header
        variant="landing"
        user={isAuthenticated ? user : null}
        isDark={isDark}
        onLogin={() => navigate(isAuthenticated ? "/searching" : "/login")}
        onToggleTheme={toggleTheme}
      />

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-content">
            <p className="landing-eyebrow">Cooperación para el desarrollo</p>
            <h1 id="landing-title">Bienvenido a <span>Coopera2075</span></h1>
            <p className="landing-hero-description">
              Conectamos iniciativas, organizaciones y oportunidades para
              contribuir a un desarrollo más justo y sostenible.
            </p>
            <div className="landing-hero-actions">
              <button
                className="landing-primary-button"
                type="button"
                onClick={() => navigate(isAuthenticated ? "/searching" : "/register")}
              >
                {isAuthenticated ? "Explorar oportunidades" : "Únete a la comunidad"}
              </button>
              <a className="landing-secondary-link" href="#casos-de-exito">
                Conoce nuestro impacto <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="landing-hero-art" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-art-center">
              <span className="hero-art-sun">✳</span>
              <span>Cooperar<br />para transformar</span>
            </div>
            <span className="hero-art-label hero-label-one">Alianzas</span>
            <span className="hero-art-label hero-label-two">Impacto</span>
            <span className="hero-art-label hero-label-three">Desarrollo</span>
          </div>
        </section>

        <section className="landing-intro">
          <div className="landing-intro-marker" aria-hidden="true">01</div>
          <div className="landing-intro-copy">
            <p className="landing-eyebrow">Nuestra misión</p>
            <h2>La cooperación crea posibilidades.</h2>
            <p>
              En Coopera2075 nos dedicamos a contribuir a la reducción de la
              pobreza, la defensa de los derechos humanos y la promoción de
              iniciativas transformadoras de alcance internacional. Creemos en
              el poder de las alianzas para convertir ideas en oportunidades.
            </p>
          </div>
          <div className="landing-intro-stat">
            <span aria-hidden="true">∞</span>
            <p>Un futuro construido<br />en colaboración</p>
          </div>
        </section>

        <section className="landing-showcase" id="casos-de-exito">
          <div className="showcase-heading">
            <div>
              <p className="landing-eyebrow">Lo que nos inspira</p>
              <h2>Casos de éxito</h2>
            </div>
            <a className="showcase-more-link" href="#contacto">
              Ver más <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="showcase-grid">
            {successStories.map((item, index) => (
              <ShowcaseCard
                key={item.title}
                item={item}
                index={index}
                section="Casos de éxito"
              />
            ))}
          </div>
        </section>

        <section className="landing-showcase landing-projects" id="proyectos">
          <div className="showcase-heading">
            <div>
              <p className="landing-eyebrow">Ideas en movimiento</p>
              <h2>Proyectos en desarrollo</h2>
            </div>
            <button
              className="showcase-more-link"
              type="button"
              onClick={() => navigate(isAuthenticated ? "/callProposal" : "/login")}
            >
              Ver más <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="showcase-grid">
            {projectsInProgress.map((item, index) => (
              <ShowcaseCard
                key={item.title}
                item={item}
                index={index}
                section="Proyecto en desarrollo"
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing