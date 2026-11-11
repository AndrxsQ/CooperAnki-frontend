import { ProjectDashboardSection } from "../components/ProjectDashboardSection";

const CooperationHome = () => (
  <section
    aria-labelledby="cooperation-home-title"
    className="grid scroll-mt-24 gap-6"
  >
    <div className="grid gap-2">
      <h1
        id="cooperation-home-title"
        className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
      >
        Sistema de cooperación
      </h1>
      <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Gestiona las propuestas de cooperación, el catálogo de convocatorias y
        el matching asistido por inteligencia artificial.
      </p>
    </div>

    <ProjectDashboardSection />
  </section>
);

export default CooperationHome;
