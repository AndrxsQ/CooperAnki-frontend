import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const casesBasePath = "/legal-management/cases";

const caseHierarchy = [
  {
    id: "constitucional",
    title: "Jurisdicción Constitucional",
    description:
      "Procesos de tutela y control abstracto de constitucionalidad.",
    children: [
      {
        id: "tutela-asomuproca",
        title: "Acción de Tutela (Caso ASOMUPROCA)",
        description: "Tutela y seguimiento constitucional del caso.",
        children: [
          {
            id: "reparacion-colectiva-tutela",
            title: "Reparación Colectiva - Acción de Tutela",
            description:
              "Tutela relacionada con el predio Los Playones y el subsidio de tierras.",
            details: [
              ["Despacho judicial", "Corte Constitucional / Tribunal Superior de Cartagena"],
              ["Radicado de origen", "47-001-2331-002-2010-00254-00 / 2016-00123"],
              ["Radicado Corte Constitucional", "T-2.978.237 (Sentencia T-610 de 2011)"],
              [
                "Objeto / pretensión",
                'Tutela contra la Caja Agraria en liquidación e INCODER para suspender el remate judicial ejecutivo del predio "Los Playones" y congelar la condición resolutoria del subsidio de tierras.',
              ],
              ["Estado procesal", "Inactivo (concluido con fallo favorable definitivo)."],
              [
                "Resultado / situación actual",
                "Amparo de derechos de campesinas, suspensión de cobros ejecutivos y congelamiento de medidas de remate.",
              ],
            ],
          },
          {
            id: "seguimiento-constitucional-pirc",
            title: "Seguimiento Constitucional PIRC",
            description: "Proceso de seguimiento de las órdenes constitucionales.",
            details: [
              ["Tipo", "Proceso de seguimiento"],
              ["Entidades involucradas", "Corte Constitucional / UARIV"],
            ],
          },
        ],
      },
      {
        id: "control-abstracto",
        title: "Control Abstracto de Constitucionalidad",
        description: "Coadyuvancia en demandas de inconstitucionalidad.",
        children: [
          {
            id: "coadyuvancia-demandas-inconstitucionalidad",
            title: "Coadyuvancia en Demandas de Inconstitucionalidad",
            description: "Sentencia C-035 de 2016.",
            details: [
              ["Despacho judicial", "Corte Constitucional"],
              ["Radicado / providencia", "Sentencia C-035 de 2016"],
              [
                "Objeto / pretensión",
                "Coadyuvancia ciudadana que visibiliza el impacto extractivo sobre la producción agrícola, ganadera y la seguridad alimentaria de las mujeres campesinas del Caribe (Código de Minas).",
              ],
              ["Estado procesal", "Inactivo (fallado por la Corte Constitucional)."],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "transicional-paz",
    title: "Jurisdicción Transicional y para la Paz",
    description:
      "Actuaciones en Justicia y Paz y ante el Sistema Integral para la Paz.",
    children: [
      {
        id: "justicia-y-paz",
        title: "Justicia y Paz (Ley 975 de 2005)",
        description: "Investigación por desplazamiento masivo y homicidio.",
        children: [
          {
            id: "investigacion-desplazamiento-homicidio",
            title: "Investigación por Desplazamiento Masivo y Homicidio",
            description: "Investigación en el marco de Justicia y Paz.",
            details: [
              ["Despacho judicial", "Fiscalía 31 Seccional / Delegada ante el Tribunal de Justicia y Paz"],
              ["Radicado procesal", "20190230186721"],
              ["Sujeto / estructura investigada", "Salvatore Mancuso / Bloque Norte de las AUC"],
              [
                "Priorización de cargo",
                "Cargo 1011: patrón de macrocriminalidad por desplazamiento masivo y violencia basada en género contra 75 mujeres de ASOMUPROCA.",
              ],
            ],
          },
        ],
      },
      {
        id: "jep-sivjrnr",
        title: "Jurisdicción Especial para la Paz (JEP) y Sistema Integral (SIVJRNR)",
        description: "Representación colectiva e interseccional.",
        children: [
          {
            id: "representacion-colectiva-interseccional",
            title: "Representación Colectiva e Interseccional",
            description: "Actuaciones ante las salas y secciones del SIVJRNR.",
            details: [
              ["Instancia judicial", "Salas y Secciones del SIVJRNR"],
              ["Enfoque técnico", "Interseccional (género, condición campesina e impacto del conflicto)."],
              [
                "Documentación / alcance",
                "Entrega de informes colectivos con más de 300 casos individualizados y 1.115 personas victimizadas por FARC-EP y Fuerza Pública.",
              ],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "restitucion-tierras",
    title: "Jurisdicción Especializada en Restitución de Tierras",
    description: "Fase de fallo y seguimiento pos-fallo de restitución.",
    children: [
      {
        id: "fase-fallo",
        title: "Fase de Fallo",
        description: "Sentencia de restitución de tierras.",
        children: [
          {
            id: "sentencia-restitucion-tierras",
            title: "Sentencia de Restitución de Tierras",
            description: "Fallo y órdenes de restitución por equivalencia.",
            details: [
              [
                "Despacho judicial",
                "Sala Civil Especializada en Restitución de Tierras del Tribunal Superior del Distrito Judicial de Cartagena",
              ],
              ["Radicado procesal", "47001312100220150004201 (rad. interno: 2015-00420)"],
              [
                "Medida cautelar / registral",
                "Medida registral de no enajenación ante la Oficina de Registro de Instrumentos Públicos.",
              ],
              [
                "Providencias",
                "Sentencia del 29 de abril de 2022 y Auto de Adición del 10 de octubre de 2022.",
              ],
              [
                "Órdenes de ejecución medulares",
                "Restitución por equivalencia socioeconómica de 1.500 hectáreas a favor de 75 mujeres socias y sus núcleos familiares.",
              ],
              ["Orden 5.2", "Entrega material de predio equivalente a ASOMUPROCA."],
              ["Orden 5.6", "Inexistencia legal de ventas y enajenaciones celebradas en desplazamiento."],
              ["Órdenes 5.20 y 5.22", "Atenciones integrales (vivienda, salud, proyectos productivos)."],
              ["Orden 5.35", "Evaluación inmediata de riesgo y medidas de protección por la UNP."],
            ],
          },
        ],
      },
      {
        id: "fase-posfallo",
        title: "Fase de Pos-Fallo (2022–2026)",
        description: "Seguimiento a medidas ambientales y administrativas.",
        children: [
          {
            id: "seguimiento-medidas-ambientales",
            title: "Seguimiento a Medidas Ambientales y Administrativas",
            description: "Seguimiento a restricciones y condiciones de uso del suelo.",
            details: [
              [
                "Entidades involucradas",
                "Grupo Fondo de Restitución de Tierras y Territorios (GFRTT), UAEGRTD (Dirección Territorial Magdalena), CORPAMAG y Parques Nacionales Naturales.",
              ],
              [
                "Objeto / trabas",
                "Seguimiento a restricciones ambientales, usabilidad del suelo, porcentajes de riesgo de inundación y limitaciones a la explotación agropecuaria.",
              ],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "contencioso-administrativa",
    title: "Jurisdicción Contencioso Administrativa",
    description: "Acciones colectivas por actuaciones u omisiones estatales.",
    children: [
      {
        id: "acciones-colectivas",
        title: "Acciones Colectivas",
        description: "Acción de grupo por omisión estatal.",
        children: [
          {
            id: "accion-grupo-omision-estatal",
            title: "Acción de Grupo por Omisión Estatal",
            description: "Reclamación colectiva por despojo armado y falta de protección.",
            details: [
              ["Despacho judicial", "Juzgado Sexto Administrativo del Circuito de Santa Marta"],
              ["Radicado procesal", "47001333100620110025800 (rad. interno: 2011-00258)"],
              [
                "Objeto / pretensión",
                "Indemnización de perjuicios materiales e inmateriales colectivos por la omisión estatal en la contención del despojo armado y falta de protección.",
              ],
              [
                "Estado procesal",
                "Pendiente de resolución de excepciones previas y alegatos de conclusión.",
              ],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ordinaria",
    title: "Jurisdicción Ordinaria",
    description: "Procesos de las especialidades civil y penal.",
    children: [
      {
        id: "especialidad-civil",
        title: "Especialidad Civil Ordinaria",
        description: "Revocatoria de proceso ejecutivo mixto.",
        children: [
          {
            id: "revocatoria-proceso-ejecutivo-mixto",
            title: "Revocatoria de Proceso Ejecutivo Mixto",
            description: "Cumplimiento de órdenes de la sentencia de restitución.",
            details: [
              ["Despacho judicial", "Juzgado Civil del Circuito de Fundación (Magdalena)"],
              ["Radicado procesal", "47-288-3103-001-1999-0112 (codificación actual: 2000-00060)"],
              [
                "Objeto / pretensión",
                'Cumplimiento directo de la Orden 5.8 de la Sentencia de Restitución (revocatoria de actuaciones y remates en el predio "Los Playones").',
              ],
              [
                "Estado procesal",
                "Pendiente de notificación ejecutoria y acatamiento formal para archivo definitivo.",
              ],
            ],
          },
        ],
      },
      {
        id: "especialidad-penal",
        title: "Especialidad Penal Ordinaria",
        description: "Denuncia por despojo y trampas registrales.",
        children: [
          {
            id: "denuncia-despojo-trampas-registrales",
            title: "Denuncia por Despojo y Trampas Registrales",
            description: "Investigación penal por despojo, alteración documental y falsedad.",
            details: [
              ["Despacho judicial", "Fiscalía 31 Seccional de Santa Marta"],
              ["Radicado procesal", "4700161020201500351 (rad. interno: 2015-00351)"],
              [
                "Objeto / pretensión",
                "Investigación penal por despojo de inmuebles, alteración de documentos ante Cámara de Comercio y falsedad procedimental.",
              ],
              [
                "Estado procesal",
                "Desconocido (cierre del despacho por comisiones de servicio e inspecciones internas).",
              ],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "internacional-ddhh",
    title: "Sistema Internacional de Derechos Humanos (DDHH)",
    description: "Actuaciones ante los sistemas universal e interamericano.",
    children: [
      {
        id: "sistema-universal-onu",
        title: "Sistema Universal de Protección (ONU)",
        description: "Intervenciones y actuaciones ante mecanismos de Naciones Unidas.",
        children: [
          {
            id: "estatus-consultivo-ecosoc",
            title: "Estatus Consultivo ECOSOC (2019)",
            description: "Intervenciones escritas y orales ante el Consejo de Derechos Humanos.",
            details: [
              [
                "Objeto / habilitación",
                "Intervenciones escritas y orales ante el Consejo de Derechos Humanos en Ginebra.",
              ],
            ],
          },
          {
            id: "comite-cedaw",
            title: "Comité CEDAW (2019)",
            description: "Inclusión del caso ASOMUPROCA en informe sombra.",
            details: [
              [
                "Objeto / documento",
                "Inclusión del caso ASOMUPROCA en el Informe Sombra de la Sociedad Civil sobre Colombia (violación de los artículos 14 y 15).",
              ],
            ],
          },
          {
            id: "relatoria-defensores-ddhh",
            title: "Relatoría Especial sobre Defensores de Derechos Humanos",
            description: "Llamamientos e informes por persecución y falta de garantías.",
            details: [
              [
                "Objeto / documento",
                "Llamamientos urgentes e informes por persecución, acoso judicial y falta de garantías para el equipo jurídico de COLEMAD y lideresas.",
              ],
            ],
          },
        ],
      },
      {
        id: "sistema-interamericano-cidh",
        title: "Sistema Interamericano (CIDH)",
        description: "Actuaciones ante la Comisión Interamericana de Derechos Humanos.",
        children: [
          {
            id: "audiencias-cidh",
            title: "Audiencias Públicas Temáticas y de Casos (2011, 2016, 2018, 2023)",
            description: "Denuncia de patrones de despojo y trabas en restitución.",
            details: [
              [
                "Objeto / acción",
                "Denuncia ante la CIDH sobre patrones de despojo territorial, trabas en restitución y enfoque ecofeminista.",
              ],
            ],
          },
          {
            id: "medidas-cautelares-cidh",
            title: "Solicitud de Medidas Cautelares (2011 / 2012)",
            description: "Solicitud de protección para el equipo jurídico y la junta de ASOMUPROCA.",
            details: [
              [
                "Objeto / acción",
                "Protecciones para salvaguardar la vida, libertad e integridad del equipo jurídico de COLEMAD y junta de ASOMUPROCA.",
              ],
            ],
          },
        ],
      },
    ],
  },
];

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

const collectNodes = (nodes, ancestors = []) =>
  nodes.flatMap((node) => {
    const lineage = [...ancestors, node];
    const searchableContent = [
      node.title,
      node.description,
      ...(node.details ?? []).flat(),
    ].join(" ");
    return [
      { ...node, ancestors, searchableContent },
      ...collectNodes(node.children ?? [], lineage),
    ];
  });

const findNodePath = (nodes, segments, ancestors = []) => {
  if (segments.length === 0) {
    return { ancestors, node: null };
  }

  const node = nodes.find((candidate) => candidate.id === segments[0]);
  if (!node) {
    return null;
  }

  const nextAncestors = [...ancestors, node];
  if (segments.length === 1) {
    return { ancestors, node };
  }

  const childPath = findNodePath(
    node.children ?? [],
    segments.slice(1),
    nextAncestors,
  );
  return childPath;
};

const getNodePath = (node) =>
  [...node.ancestors, node].map((ancestor) => ancestor.id).join("/");

const LegalCases = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResetKey, setSearchResetKey] = useState(0);
  const routeSegments = location.pathname
    .slice(casesBasePath.length)
    .split("/")
    .filter(Boolean);
  const currentPath = findNodePath(caseHierarchy, routeSegments);
  const currentNode = currentPath?.node ?? null;
  const currentChildren = currentNode?.children ?? caseHierarchy;
  const allNodes = useMemo(() => collectNodes(caseHierarchy), []);
  const normalizedSearch = normalizeSearchText(search);
  const searchResults = normalizedSearch
    ? allNodes.filter((node) =>
        normalizeSearchText(node.searchableContent).includes(normalizedSearch),
      )
    : [];
  const isSearching = Boolean(normalizedSearch);

  const openNode = (node) => {
    navigate(`${casesBasePath}/${getNodePath(node)}`);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchResetKey((key) => key + 1);
  };

  if (!currentPath) {
    return (
      <section className="grid gap-4">
        <h1 className="m-0 text-2xl font-bold text-slate-900 dark:text-slate-100">
          No se encontró esta carpeta
        </h1>
        <button
          className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onClick={() => navigate(casesBasePath)}
        >
          Volver a Expedientes
        </button>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="legal-cases-title"
      className="grid scroll-mt-24 gap-6"
    >
      <div className="grid gap-2">
        <h1
          id="legal-cases-title"
          className="m-0 text-[clamp(26px,3vw,34px)] font-bold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Expedientes
        </h1>
        <p className="m-0 max-w-[760px] text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Explora las jurisdicciones, clasificaciones y actuaciones en una
          estructura de carpetas.
        </p>
      </div>

      <SearchBar
        key={searchResetKey}
        label="Buscar en expedientes"
        placeholder="Buscar jurisdicción, expediente, radicado o actuación..."
        debounceMs={250}
        onSearch={setSearch}
      />

      {!isSearching && routeSegments.length > 0 && (
        <nav
          aria-label="Ruta de navegación de expedientes"
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <button
            className="border-0 bg-transparent p-0 font-semibold text-sky-700 hover:underline dark:text-sky-300"
            type="button"
            onClick={() => navigate(casesBasePath)}
          >
            Jurisdicciones
          </button>
          {[...(currentPath.ancestors ?? []), currentNode].map(
            (node, index, lineage) => (
              <span className="contents" key={node.id}>
                <span aria-hidden="true" className="text-slate-400">
                  /
                </span>
                {index === lineage.length - 1 ? (
                  <span
                    aria-current="page"
                    className="font-medium text-slate-700 dark:text-slate-200"
                  >
                    {node.title}
                  </span>
                ) : (
                  <button
                    className="border-0 bg-transparent p-0 text-sky-700 hover:underline dark:text-sky-300"
                    type="button"
                    onClick={() =>
                      navigate(
                        `${casesBasePath}/${lineage
                          .slice(0, index + 1)
                          .map((item) => item.id)
                          .join("/")}`,
                      )
                    }
                  >
                    {node.title}
                  </button>
                )}
              </span>
            ),
          )}
        </nav>
      )}

      {currentNode && !isSearching && (
        <button
          className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onClick={() =>
            navigate(
              currentPath.ancestors.length
                ? `${casesBasePath}/${currentPath.ancestors
                    .map((node) => node.id)
                    .join("/")}`
                : casesBasePath,
            )
          }
        >
          ← Volver a {currentPath.ancestors.at(-1)?.title ?? "Jurisdicciones"}
        </button>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900 dark:text-slate-100">
            {isSearching
              ? "Resultados de búsqueda"
              : currentNode?.title ?? "Jurisdicciones"}
          </h2>
          <p className="mb-0 mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isSearching
              ? `${searchResults.length} coincidencia(s) en toda la clasificación`
              : currentNode?.description ??
                "Selecciona una jurisdicción para explorar sus clasificaciones."}
          </p>
        </div>
        {isSearching && (
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            onClick={clearSearch}
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      {isSearching ? (
        searchResults.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((result) => (
              <button
                key={result.id}
                className="group flex min-h-44 flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-600"
                type="button"
                onClick={() => openNode(result)}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                  {[...result.ancestors, result].length > 1
                    ? [...result.ancestors, result]
                        .slice(0, -1)
                        .map((node) => node.title)
                        .join(" / ")
                    : "Jurisdicción"}
                </span>
                <span className="mt-3 text-base font-bold text-slate-900 group-hover:text-sky-800 dark:text-slate-100 dark:group-hover:text-sky-300">
                  {result.title}
                </span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {result.description}
                </span>
                <span className="mt-auto pt-4 text-sm font-semibold text-sky-700 dark:text-sky-300">
                  {result.children?.length
                    ? `Abrir ${result.children.length} elemento(s)`
                    : "Ver información"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            No se encontraron jurisdicciones, expedientes o actuaciones con ese
            término.
          </p>
        )
      ) : currentNode?.details ? (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700 sm:px-6">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
              Ficha del expediente / actuación
            </p>
            <h3 className="mb-0 mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentNode.title}
            </h3>
            {currentNode.description && (
              <p className="mb-0 mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {currentNode.description}
              </p>
            )}
          </div>
          <dl className="m-0 grid divide-y divide-slate-100 dark:divide-slate-700">
            {currentNode.details.map(([label, value]) => (
              <div
                className="grid gap-1.5 px-5 py-4 sm:grid-cols-[minmax(180px,0.35fr)_1fr] sm:gap-6 sm:px-6"
                key={label}
              >
                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {label}
                </dt>
                <dd className="m-0 whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ) : currentChildren.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {currentChildren.map((node) => (
            <button
              key={node.id}
              className="group flex min-h-48 flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-sky-600"
              type="button"
              onClick={() => openNode({ ...node, ancestors: currentPath.ancestors.concat(currentNode).filter(Boolean) })}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                {node.children?.length
                  ? "Clasificación"
                  : "Expediente / actuación"}
              </span>
              <span className="mt-3 text-lg font-bold text-slate-900 group-hover:text-sky-800 dark:text-slate-100 dark:group-hover:text-sky-300">
                {node.title}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {node.description}
              </span>
              <span className="mt-auto pt-5 text-sm font-semibold text-sky-700 dark:text-sky-300">
                {node.children?.length
                  ? `Explorar ${node.children.length} elemento(s) →`
                  : "Abrir ficha →"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Esta clasificación todavía no contiene expedientes.
        </p>
      )}
    </section>
  );
};

export default LegalCases;
