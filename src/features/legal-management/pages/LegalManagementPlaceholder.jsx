const LegalManagementPlaceholder = ({ title }) => (
  <section
    aria-labelledby="legal-management-title"
    className="grid scroll-mt-24 gap-3"
  >
    <h1
      id="legal-management-title"
      className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
    >
      {title}
    </h1>
    <p className="m-0 max-w-[680px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
      Esta sección estará disponible próximamente.
    </p>
  </section>
);

export default LegalManagementPlaceholder;
