const yesNo = ["Sí", "No"];
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const surveyDepartments = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá, D. C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés, Providencia y Santa Catalina",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

const municipalitiesByDepartment = {
  Amazonas: ["Leticia", "Puerto Nariño"],
  Antioquia: ["Medellín", "Apartadó", "Bello", "Envigado", "Turbo"],
  Arauca: ["Arauca", "Arauquita", "Saravena"],
  Atlántico: ["Barranquilla", "Baranoa", "Malambo", "Soledad"],
  "Bogotá, D. C.": ["Bogotá"],
  Bolívar: ["Cartagena", "Magangué", "Turbaco"],
  Boyacá: ["Tunja", "Duitama", "Sogamoso"],
  Caldas: ["Manizales", "Chinchiná", "La Dorada"],
  Caquetá: ["Florencia", "San Vicente del Caguán"],
  Casanare: ["Yopal", "Aguazul", "Villanueva"],
  Cauca: ["Popayán", "Santander de Quilichao"],
  Cesar: ["Valledupar", "Aguachica", "Bosconia"],
  Chocó: ["Quibdó", "Istmina"],
  Córdoba: ["Montería", "Cereté", "Lorica"],
  Cundinamarca: ["Soacha", "Facatativá", "Girardot", "Zipaquirá"],
  Guainía: ["Inírida"],
  Guaviare: ["San José del Guaviare"],
  Huila: ["Neiva", "Garzón", "Pitalito"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  Magdalena: [
    "Santa Marta",
    "Puebloviejo",
    "Ciénaga",
    "Pivijay",
    "El Retén",
    "Aracataca",
    "Fundación",
    "Zona Bananera",
  ],
  Meta: ["Villavicencio", "Acacías", "Granada"],
  Nariño: ["Pasto", "Ipiales", "Tumaco"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona"],
  Putumayo: ["Mocoa", "Puerto Asís"],
  Quindío: ["Armenia", "Calarcá", "Montenegro"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andrés, Providencia y Santa Catalina": ["San Andrés", "Providencia"],
  Santander: ["Bucaramanga", "Barrancabermeja", "Floridablanca"],
  Sucre: ["Sincelejo", "Corozal", "Sampués"],
  Tolima: ["Ibagué", "Espinal", "Chaparral"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá"],
  Vaupés: ["Mitú"],
  Vichada: ["Puerto Carreño"],
};

const step = (id, section, title, type, options, extra = {}) => ({
  id,
  section,
  title,
  type,
  options,
  allowUnknown: true,
  ...extra,
});

const text = (id, section, title, extra = {}) =>
  step(id, section, title, "text", null, extra);
const number = (id, section, title, extra = {}) =>
  step(id, section, title, "number", null, extra);
const textarea = (id, section, title, extra = {}) =>
  step(id, section, title, "textarea", null, extra);
const select = (id, section, title, options, extra = {}) =>
  step(id, section, title, "select", options, extra);
const radio = (id, section, title, options, extra = {}) =>
  step(id, section, title, "radio", options, extra);
const multi = (id, section, title, options, extra = {}) =>
  step(id, section, title, "multi", options, extra);

const getCount = (answers, id) => {
  const count = Number.parseInt(answers[id], 10);
  return Number.isFinite(count) ? Math.min(Math.max(count, 0), 30) : 0;
};

const familyMemberName = (answers, index) =>
  answers[`household.${index}.name`] || `Integrante ${index + 1}`;

export const getHouseholdMembers = (answers) => [
  "Usted (mujer lideresa)",
  ...Array.from({ length: getCount(answers, "17") }, (_, index) =>
    familyMemberName(answers, index),
  ),
];

const addOtherText = (steps, id, title, trigger) => {
  const question = steps.find((candidate) => candidate.id === id);
  if (!question) {
    throw new Error(`No se encontró la pregunta ${id} para agregar texto adicional.`);
  }
  question.inlineInputs = [
    ...(question.inlineInputs ?? []),
    {
      id: `${id}.other`,
      label: title,
      when: trigger,
      placeholder: "Especifique",
    },
  ];
};

export const buildSurveySteps = (answers) => {
  const steps = [];
  const profile = "Perfil de la mujer lideresa";
  const household = "Composición y aportes de la unidad económica familiar";
  const income = "Fuentes de ingresos familiares";
  const skills = "Actividades productivas, oficios y servicios profesionales";
  const business = "Negocio actual y modalidad empresarial";
  const assets = "Activos e infraestructura productiva";

  steps.push(
    text("1", profile, "Nombre completo"),
    select("2", profile, "Tipo de identificación", [
      "Tarjeta de Identidad",
      "Cédula de Ciudadanía",
      "Cédula de Extranjería",
      "Otro",
    ]),
    number("3", profile, "Número de identificación"),
    number("4", profile, "Edad", { min: 0, max: 120 }),
    number("5", profile, "Número de teléfono"),
    text("6", profile, "Correo electrónico", { inputType: "email" }),
    select("7", profile, "Nivel de escolaridad", [
      "Sin escolaridad formal",
      "Primaria",
      "Secundaria",
      "Técnica o tecnológica",
      "Universitaria/Profesional",
      "Otra",
    ]),
    select("8", profile, "Departamento donde vive actualmente", surveyDepartments),
  );
  addOtherText(steps, "2", "Especifique el tipo de identificación", "Otro");

  const selectedDepartment = answers["8"];
  const municipalities = municipalitiesByDepartment[selectedDepartment] ?? [];
  steps.push(
    select(
      "9",
      profile,
      "Municipio donde vive actualmente",
      [...municipalities, "Otro"],
      {
        disabled:
          !selectedDepartment ||
          selectedDepartment === "No sabe / No responde",
        helperText:
          "Si el municipio no aparece, seleccione “Otro”.",
      },
    ),
    text("10", profile, "Corregimiento / Vereda / Barrio donde vive actualmente"),
    select("birth.department", profile, "Departamento donde nació", surveyDepartments),
    select(
      "birth.municipality",
      profile,
      "Municipio donde nació",
      [
        ...(municipalitiesByDepartment[answers["birth.department"]] ?? []),
        "Otro",
      ],
      {
        disabled:
          !answers["birth.department"] ||
          answers["birth.department"] === "No sabe / No responde",
        helperText: "Si el municipio no aparece, seleccione “Otro”.",
      },
    ),
    text("birth.neighborhood", profile, "Corregimiento / Vereda / Barrio donde nació"),
  );
  addOtherText(steps, "9", "Especifique el municipio", "Otro");
  addOtherText(
    steps,
    "birth.municipality",
    "Especifique el municipio donde nació",
    "Otro",
  );
  steps.push(
    radio("literacy", profile, "¿Sabe leer, escribir y realizar cálculos básicos para manejar su negocio?", [
      "Sí",
      "Con apoyo",
      "No",
    ]),
    radio("socials", profile, "¿Utiliza redes sociales?", [
      "Sí",
      "Con apoyo",
      "No",
    ]),
  );
  if (["Sí", "Con apoyo"].includes(answers.socials)) {
    steps.push(
      multi(
        "socials.which",
        profile,
        "¿Cuáles redes sociales utiliza?",
        ["WhatsApp", "Facebook", "Instagram", "TikTok", "Otras"],
      ),
    );
    addOtherText(steps, "socials.which", "¿Cuáles otras redes sociales?", "Otras");
  }
  steps.push(
    textarea("11", profile, "¿Cuál es su ocupación o actividad económica principal?"),
    radio("12", profile, "¿Cuánto tiempo de experiencia tiene en esta actividad?", [
      "Menos de 1 año",
      "1–3 años",
      "4–10 años",
      "Más de 10 años",
    ]),
    textarea("13", profile, "¿Qué labores o actividades realiza personalmente (producción, compras, ventas, cuentas, administración u otras)?"),
    radio("14", profile, "¿Ha liderado algún negocio, grupo, asociación o actividad comunitaria?", yesNo, {
      inlineInputs: [
        {
          id: "14.details",
          label: "¿Cuáles?",
          when: "Sí",
          type: "textarea",
        },
      ],
    }),
    text("15", profile, "¿Cuánto tiempo por semana puede dedicar al negocio o formación?"),
    radio("16", profile, "¿Tiene alguna actividad de pasatiempo u ocio?", yesNo, {
      inlineInputs: [
        {
          id: "16.details",
          label: "¿Cuáles?",
          when: "Sí",
          type: "textarea",
        },
      ],
    }),
  );

  steps.push(
    number("17", household, "¿Cuántos integrantes tiene su hogar además de usted?", {
      min: 0,
      max: 30,
      helperText: "Si no hay otras personas en el hogar, ingrese 0.",
    }),
  );
  const householdCount = getCount(answers, "17");
  for (let index = 0; index < householdCount; index += 1) {
    const prefix = `household.${index}`;
    const member = familyMemberName(answers, index);
    steps.push(
      text(`${prefix}.name`, household, "Nombre completo"),
      number(`${prefix}.identification`, household, `Número de identificación de ${member}`),
      number(`${prefix}.age`, household, `Edad de ${member}`, { min: 0, max: 120 }),
      select(`${prefix}.kinship`, household, `Parentesco de ${member}`, [
        "Hijo o Hija",
        "Padre",
        "Madre",
        "Hermano o Hermana",
        "Abuelo o Abuela",
        "Nieto o Nieta",
        "Tío o tía",
        "Otro",
      ]),
    );
    addOtherText(steps, `${prefix}.kinship`, `Especifique el parentesco de ${member}`, "Otro");
    steps.push(
      textarea(`${prefix}.occupation`, household, `Ocupación o fuente de ingreso de ${member}`),
      number(`${prefix}.contribution`, household, `Aporte monetario aproximado al mes (COP) de ${member}`, { min: 0 }),
      textarea(`${prefix}.nonMonetary`, household, `Aportes no monetarios (trabajo, cuidados, activos, contactos) de ${member}`),
    );
  }

  const members = getHouseholdMembers(answers);
  steps.push(
    multi("19.people", household, "¿Quiénes colaboran actualmente en las actividades económicas familiares?", [
      ...members,
      "Nadie actualmente",
    ], {
      repeatText: {
        prefix: "19.tasks",
        options: members,
        label: "¿En qué tareas colabora?",
      },
    }),
    multi("20.people", household, "¿Quién asume tareas de cuidado, cocina, limpieza y apoyo doméstico?", members),
    step("20.hours", household, "Horas semanales dedicadas a las tareas domésticas", "repeat-number", null, {
      repeatFrom: "20.people",
      options: members,
      label: "¿Cuántas horas dedica?",
      min: 0,
    }),
    radio("21", household, "¿Hay actividades económicas que comparten varias personas de la familia?", yesNo),
  );
  if (answers["21"] === "Sí") {
    steps.push(
      multi("21.1.people", household, "¿Quiénes participan?", members),
      textarea("21.1.details", household, "¿Cómo se dividen las responsabilidades y los pagos?"),
    );
  }

  steps.push(
    number("22", income, "¿Cuántas fuentes de ingreso tiene el hogar?", {
      min: 0,
      max: 30,
      helperText: "Si no hay fuentes de ingreso, ingrese 0.",
    }),
  );
  const incomeCount = getCount(answers, "22");
  for (let index = 0; index < incomeCount; index += 1) {
    const prefix = `income.${index}`;
    const sourceLabel = answers[`${prefix}.source`] || "esta fuente de ingreso";
    steps.push(
      text(`${prefix}.source`, income, "¿Cuál es la fuente de ingreso?"),
      select(`${prefix}.member`, income, `¿Quién genera el ingreso de ${sourceLabel}?`, members),
      number(`${prefix}.amount`, income, `Monto del ingreso de ${sourceLabel} (COP)`, { min: 0 }),
      select(`${prefix}.frequency`, income, `Frecuencia del ingreso de ${sourceLabel}`, [
        "Diaria",
        "Semanal",
        "Mensual",
        "Por temporada",
        "Otra",
      ]),
    );
    const frequencyQuestion = steps.find(
      (question) => question.id === `${prefix}.frequency`,
    );
    frequencyQuestion.inlineInputs = ["Por temporada", "Otra"].map((when) => ({
      id: `${prefix}.frequency.${when === "Otra" ? "other" : "season"}`,
      label:
        when === "Otra"
        ? `¿Cuál otra frecuencia tiene ${sourceLabel}?`
        : `Especifique la temporada de ${sourceLabel}`,
      when,
      placeholder: "Especifique",
    }));
    steps.push(
      select(`${prefix}.type`, income, `Tipo de ingreso de ${sourceLabel}`, [
        "Venta",
        "Ganancia",
        "Salario",
        "Otro",
      ]),
    );
    addOtherText(steps, `${prefix}.type`, `Especifique el tipo de ingreso de ${sourceLabel}`, "Otro");
  }

  steps.push(
    multi("23.months", income, "¿En qué meses del año aumentan o disminuyen los ingresos familiares?", months),
    textarea("23.why", income, "¿Por qué aumentan o disminuyen los ingresos en esos meses?"),
    radio("24", income, "¿La familia tiene otras fuentes, como transferencias, remesas o arriendos?", yesNo),
  );
  if (answers["24"] === "Sí") {
    steps.push(
      textarea("24.1.source", income, "¿Cuáles son las fuentes de ingreso extra?"),
      number("24.1.amount", income, "Monto aproximado de los ingresos extra (COP)", { min: 0 }),
    );
  }
  steps.push(
    number("25.amount", income, "Estimación de ingreso neto familiar total promedio por mes (COP)", { min: 0 }),
    select("25.status", income, "Calidad de la estimación de ingreso", [
      "Comprobado",
      "Estimado",
    ]),
  );

  const controlledIncomeSources = Array.from({ length: incomeCount }, (_, index) => ({
    id: `income.${index}`,
    name: answers[`income.${index}.source`] || `Fuente de ingreso ${index + 1}`,
    index,
  }));
  const otherIncomeCount = answers["26.otherEnabled"]
    ? Math.max(getCount(answers, "26.otherCount"), 1)
    : 0;
  const additionalIncomeSources = Array.from(
    { length: otherIncomeCount },
    (_, index) => ({
      id: `other.${index}`,
      name: answers[`26.otherSource.${index}`] || `Otro ingreso ${index + 1}`,
      index,
    }),
  );
  steps.push(
    step("26.detail", income, "¿Qué ingresos controla o recibe directamente usted como mujer? Especifique los detalles de cada uno.", "income-details", null, {
      incomeSources: controlledIncomeSources,
      otherIncomeEnabled: Boolean(answers["26.otherEnabled"]),
      otherIncomeCount,
      noIncomeAvailable:
        controlledIncomeSources.length === 0 && otherIncomeCount === 0,
    }),
    step("26.amount", income, "Monto mensual de cada ingreso que controla o recibe directamente (COP)", "income-amounts", null, {
      incomeSources: [...controlledIncomeSources, ...additionalIncomeSources],
      min: 0,
      noIncomeAvailable:
        controlledIncomeSources.length === 0 && otherIncomeCount === 0,
    }),
  );

  steps.push(
    radio("27.self.hasTrade", skills, "¿Tiene un oficio o profesión?", [
      "Sí",
      "No",
    ], {
      inlineInputs: [
        {
          id: "27.self.trade",
          label: "¿Cuál es su oficio o profesión?",
          when: "Sí",
        },
      ],
    }),
  );
  if (answers["27.self.hasTrade"] === "Sí") {
    steps.push(
      number("27.self.years", skills, "Años de experiencia", { min: 0 }),
      textarea("27.self.training", skills, "Formación o certificación"),
      radio("27.self.sells", skills, "¿Actualmente vende o presta el servicio?", yesNo),
    );
  }
  for (let index = 0; index < householdCount; index += 1) {
    const prefix = `27.household.${index}`;
    const member = familyMemberName(answers, index);
    steps.push(
      radio(`${prefix}.hasTrade`, skills, `¿${member} tiene un oficio o profesión?`, yesNo),
    );
    if (answers[`${prefix}.hasTrade`] === "Sí") {
      steps.push(
        text(`${prefix}.trade`, skills, `¿Cuál es el oficio o profesión de ${member}?`),
        number(`${prefix}.years`, skills, `Años de experiencia de ${member}`, { min: 0 }),
        textarea(`${prefix}.training`, skills, `Formación o certificación de ${member}`),
        radio(`${prefix}.sells`, skills, `¿${member} actualmente vende o presta el servicio?`, yesNo),
      );
    }
  }
  steps.push(
    textarea("28", skills, "¿Cuáles son sus conocimientos y habilidades más fuertes?"),
    textarea("29", skills, "¿Cuáles capacidades o habilidades familiares podrían ofrecerse a la red empresarial o a otros clientes?"),
    textarea("30", skills, "¿Qué servicios necesita el hogar contratar para producir o vender (transporte, contabilidad, reparación, diseño, etc.)?"),
    textarea("31", skills, "¿Qué servicios profesionales requieren habilitación, permiso o acreditación antes de prestarse?"),
    select("32", business, "Situación actual del negocio", [
      "Tiene negocio funcionando",
      "Trabaja por cuenta propia sin negocio formal",
      "Tiene idea de negocio",
      "No realiza actividad económica",
    ]),
    select("33", business, "Modalidad actual del negocio", [
      "Individual",
      "Familiar",
      "Asociativa",
      "Mixta",
      "Sin definir",
    ]),
    textarea("34", business, "¿Qué bienes o servicios ofrece? Menciónelos de mayor a menor importancia"),
    select("35", business, "¿Dónde opera el negocio?", [
      "Hogar",
      "Local propio",
      "Local arrendado",
      "Espacio compartido",
      "Itinerante",
      "Otro",
    ]),
  );
  addOtherText(steps, "35", "Especifique dónde opera", "Otro");
  steps.push(
    radio("36", business, "¿Tiene registros de compras, ventas, gastos o inventario?", [
      "Sí",
      "Parciales",
      "No",
    ]),
    radio("37", business, "¿Tiene formalización o permisos aplicables?", yesNo),
  );
  if (answers["37"] === "Sí") {
    steps.push(textarea("37.details", business, "¿Cuáles formalizaciones o permisos tiene?"));
  }
  steps.push(
    radio("38", business, "Si trabaja asociada, ¿existen acuerdos escritos sobre aportes, pagos, uso de equipos y decisiones?", [
      "Sí",
      "No",
      "No aplica",
    ]),
    number("39", assets, "¿Cuántos activos, espacios o herramientas tiene para operar?", {
      min: 0,
      max: 50,
      helperText: "Si no cuenta con activos, ingrese 0.",
    }),
  );

  const assetCount = getCount(answers, "39");
  for (let index = 0; index < assetCount; index += 1) {
    const prefix = `asset.${index}`;
    const assetName = answers[`${prefix}.name`] || `activo ${index + 1}`;
    steps.push(
      text(`${prefix}.name`, assets, "Nombre del activo o herramienta"),
      number(`${prefix}.quantity`, assets, `Cantidad de ${assetName}`, { min: 1 }),
      select(`${prefix}.condition`, assets, `Estado de ${assetName}`, [
        "Muy bueno",
        "Bueno",
        "Regular",
        "Malo",
        "Muy malo",
      ]),
      select(`${prefix}.use`, assets, `Tipo de uso de ${assetName}`, [
        "Personal",
        "Familiar",
        "Alquilado",
        "Prestado",
        "Otro",
      ]),
    );
    addOtherText(steps, `${prefix}.use`, `Especifique el tipo de uso de ${assetName}`, "Otro");
    steps.push(
      textarea(`${prefix}.function`, assets, `Función actual de ${assetName}`),
      textarea(`${prefix}.improvement`, assets, `Mejora necesaria para ${assetName}`),
    );
  }
  steps.push(
    multi("40", assets, "Seleccione los recursos con los que cuenta adecuadamente para operar su actividad", [
      "Agua potable",
      "Energía",
      "Conectividad",
      "Almacenamiento",
      "Saneamiento",
    ]),
  );
  if (assetCount > 0) {
    for (let index = 0; index < assetCount; index += 1) {
      const prefix = `41.${index}`;
      const assetName = answers[`asset.${index}.name`] || `Activo ${index + 1}`;
      steps.push(
        radio(prefix, assets, `¿El activo "${assetName}" puede compartirse o prestarse?`, yesNo),
      );
    }
  }
  steps.push(
    textarea("42", assets, "¿Qué infraestructura o equipo falta para vender u ofrecer el servicio con calidad y seguridad?"),
  );

  const finances = "Ventas, costos y resultados del negocio";
  const marketing = "Compradores, proveedores y comercialización";
  const governance = "Gobernanza, autonomía económica y asociatividad";
  const training = "Necesidades, inversiones y formación";
  const valueChain = "Potencial de encadenamiento productivo y de servicios";
  const legal = "Aspecto jurídico";

  steps.push(
    text("43.name", finances, "Nombre del negocio"),
    text("43.period", finances, "Periodo observado"),
    number("44.sales", finances, "Monto de ventas promedio durante el periodo (COP)", { min: 0 }),
    text("44.quantity", finances, "Cantidad de unidades o servicios vendidos durante el periodo"),
  );

  const expenseCategories = [
    ["rawMaterials", "Materias primas"],
    ["packaging", "Empaques"],
    ["transport", "Transporte"],
    ["utilities", "Energía y servicios"],
    ["maintenance", "Mantenimiento"],
    ["paidLabor", "Mano de obra remunerada"],
    ["other", "Otros costos"],
  ];
  expenseCategories.forEach(([id, label]) => {
    steps.push(
      text(`45.${id}.name`, finances, `Nombre del gasto de ${label.toLowerCase()}`),
      number(`45.${id}.amount`, finances, `Monto promedio del costo o gasto de ${label.toLowerCase()} (COP)`, { min: 0 }),
    );
  });

  steps.push(
    text("46.name", finances, "Nombre del trabajo familiar no remunerado"),
    multi("46.performer", finances, "¿Quiénes realizan el trabajo familiar no remunerado?", members),
    text("46.amount", finances, "¿Cuánto considera que se debería remunerar este trabajo?"),
    number("47.profit", finances, "Monto estimado de la ganancia neta durante el periodo (COP)", { min: 0 }),
    radio("47.usedAtHome", finances, "¿La ganancia se usa para el hogar?", yesNo),
    number("48.debt", finances, "Monto total en deudas del negocio (COP)", { min: 0 }),

    multi("49.buyers", marketing, "¿Quién compra sus productos o servicios?", [
      "Vecinos o hogares",
      "Restaurantes",
      "Comercios",
      "Turistas",
      "Empresas",
      "Instituciones",
      "Otros",
    ]),
  );
  addOtherText(steps, "49.buyers", "Especifique otros compradores", "Otros");
  steps.push(
    multi("50.channels", marketing, "¿Cómo consigue clientes?", [
      "Recomendación",
      "WhatsApp",
      "Redes sociales",
      "Punto físico",
      "Intermediarios",
      "Ferias",
      "Otro",
    ]),
  );
  addOtherText(steps, "50.channels", "Especifique otro medio para conseguir clientes", "Otro");
  steps.push(
    text("51.product", marketing, "¿Cuál de sus productos o servicios vende con mayor frecuencia?"),
    number("51.price", marketing, "¿Qué precio tiene por unidad? (COP)", { min: 0 }),
    text("51.quantity", marketing, "¿Cuántas unidades vende en promedio?"),
    textarea("52", marketing, "¿Cuáles dificultades tiene actualmente para vender y cobrar?"),
    textarea("53", marketing, "¿Dónde consigue los insumos?"),
    textarea("54", marketing, "¿Cómo transporta o entrega los productos o servicios?"),
    radio("55", marketing, "¿Conoce o utiliza herramientas digitales para comercializar?", [
      "Sí",
      "Con apoyo",
      "No",
    ]),
  );

  const decisionOptions = [...members, "Otra persona"];
  steps.push(
    select("56.decisions", governance, "¿Quién decide los precios, las compras, las ventas y las inversiones del negocio?", decisionOptions),
  );
  addOtherText(steps, "56.decisions", "¿Quién decide?", "Otra persona");
  steps.push(
    select("57.payments", governance, "¿Quién recibe los pagos, administra el dinero y decide cómo usar la ganancia?", decisionOptions),
  );
  addOtherText(steps, "57.payments", "¿Quién recibe y administra el dinero?", "Otra persona");
  steps.push(
    radio("58", governance, "¿Le interesa trabajar con otras mujeres o familias?", [
      "Sí",
      "Tal vez",
      "No",
    ]),
    multi("59", governance, "¿Qué preferiría compartir?", [
      "Compras",
      "Equipos",
      "Local",
      "Transporte",
      "Publicidad",
      "Ventas",
      "Capacitación",
      "Nada por ahora",
    ]),
    multi("60", governance, "¿Qué preocupaciones tendría al asociarse?", [
      "Pagos",
      "Confianza",
      "Decisiones",
      "Horarios",
      "Propiedad",
      "Otras",
    ]),
  );
  addOtherText(steps, "60", "¿Qué otras preocupaciones tendría al asociarse?", "Otras");
  steps.push(
    textarea("61", governance, "¿Qué condiciones necesitaría para participar sin aumentar excesivamente su carga de trabajo?"),

    multi("62", training, "¿Cuáles son sus necesidades prioritarias?", [
      "Capital de trabajo",
      "Equipo",
      "Infraestructura",
      "Permisos",
      "Clientes",
      "Transporte",
      "Formación",
      "Asesoría",
      "Otras",
    ]),
  );
  addOtherText(steps, "62", "Especifique otras necesidades prioritarias", "Otras");
  steps.push(
    multi("63.topics", training, "¿En qué temas desea formarse? (Seleccione los que apliquen)", [
      "Costos y precios",
      "Contabilidad",
      "Ventas y marketing",
      "Calidad",
      "Tecnología",
      "Liderazgo",
      "Servicio al cliente",
      "Otro",
    ]),
  );
  addOtherText(steps, "63.topics", "Especifique otro tema de formación", "Otro");
  steps.push(
    multi("63.format", training, "¿Cómo puede participar mejor en la formación? (Seleccione las opciones que apliquen)", [
      "Presencial",
      "Práctica en negocio",
      "Grupos pequeños",
      "Apoyo visual",
      "Acompañamiento individual",
    ]),
    radio("63.goal", training, "¿Tiene una meta concreta de ingresos o de crecimiento para los próximos 12 meses?", yesNo, {
      inlineInputs: [
        {
          id: "63.goal.details",
          label: "¿Cuál es su meta de ingresos o crecimiento?",
          when: "Sí",
        },
        {
          id: "63.goal.reason",
          label: "¿Por qué no tiene una meta concreta?",
          when: "No",
        },
      ],
    }),
  );

  steps.push(
    multi("64", valueChain, "¿En cuáles líneas desea participar?", [
      "Pesca y transformación",
      "Gastronomía",
      "Turismo cultural",
      "Artesanías",
      "Servicios u oficios complementarios",
      "Otra",
    ]),
    textarea("65.offer", valueChain, "¿Qué podría ofrecer a otras unidades?"),
    textarea("65.purchase", valueChain, "¿Qué necesitaría comprar de otras unidades?"),
    textarea("65.ally", valueChain, "¿Quién sería un posible aliado o proveedor?"),
    textarea("65.conditions", valueChain, "¿Habría alguna condición para trabajar juntos?"),
    textarea("65.pilot", valueChain, "¿Qué primer producto o servicio podría venderse en una prueba piloto de 30 días con este aliado o proveedor?"),

    radio("66.health", legal, "¿Padece alguna enfermedad grave, crónica o condición de discapacidad que requiera atención o medicamentos constantes?", yesNo),
  );
  addOtherText(steps, "64", "¿Cuál otra línea?", "Otra");
  steps[steps.length - 1].inlineInputs = [
    {
      id: "66.health.details",
      label: "¿Cuál enfermedad o condición requiere atención o medicamentos constantes?",
      when: "Sí",
    },
  ];
  steps.push(
    radio("67.dependents", legal, "¿Tiene en su núcleo familiar niños, adultos mayores, personas con discapacidad o enfermedades graves que dependan de usted?", yesNo),
  );
  steps[steps.length - 1].inlineInputs = [
    {
      id: "67.dependents.details",
      label: "Describa las personas dependientes y sus necesidades",
      when: "Sí",
      type: "textarea",
    },
  ];
  steps.push(
    radio("68.aid", legal, "¿Recibió el último giro de Atención Humanitaria de Emergencia por parte de la UARIV?", yesNo),
  );
  if (answers["68.aid"] === "Sí") {
    steps.push(
      text("68.aid.date", legal, "Fecha en que recibió el último giro de Atención Humanitaria de Emergencia", { inputType: "date" }),
      number("68.aid.amount", legal, "Monto del último giro recibido (COP)", { min: 0 }),
    );
  }
  steps.push(
    radio("69", legal, "¿Recibió alguna notificación o resolución escrita por parte de la UARIV donde le informen del estado de su ayuda humanitaria?", yesNo),
    select("70", legal, "¿Cuál es el medio de comunicación por el que prefiere recibir información sobre sus procesos?", [
      "WhatsApp",
      "Llamada telefónica",
      "Correo electrónico",
      "Requiero apoyo para comunicarme",
      "Otro",
    ]),
  );
  addOtherText(steps, "70", "¿Cuál otro medio de comunicación prefiere?", "Otro");

  return steps;
};

export const getMunicipalityOptions = (department) =>
  municipalitiesByDepartment[department] ?? [];

export const isUnknownAnswer = (answer) => answer === "No sabe / No responde";
