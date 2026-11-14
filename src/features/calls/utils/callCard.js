// Normalización de los campos opcionales que envía el backend: un texto vacío
// o ausente se convierte en null para que la UI muestre "No especificado".
export const toText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

// Algunos campos llegan como texto o como lista de textos (p. ej. poblaciones
// objetivo). La lista se une con saltos de línea para que el detalle la
// muestre como viñetas.
export const toTextList = (value) => {
  if (Array.isArray(value)) {
    const items = value.map(toText).filter(Boolean);
    return items.length ? items.join("\n") : null;
  }
  return toText(value);
};

export const toAmount = (value) => {
  if (value === null || value === undefined || value === "") return null;
  return Number.isFinite(Number(value)) ? Number(value) : null;
};

// Convierte una convocatoria del catálogo (funding_opportunities) en la forma
// que consumen ConvocatoriaCard y ConvocatoriaDetailView.
export const toCallCardFromOpportunity = (opportunity) => ({
  id: opportunity.id,
  titulo: opportunity.title,
  organismoDonante: opportunity.cooperatingEntity,
  ods: [],
  montoMaximo: opportunity.maxAmount,
  fechaCierre: opportunity.closingDate,
  enlaceOficial: opportunity.sourceUrl,
  descripcion: opportunity.requirementsDescription,
  areaImpacto: toText(opportunity.impactArea),
  // El catálogo no calcula compatibilidad: los componentes omiten ese bloque.
  compatibilityScore: null,
  matchingJustification: null,
  paisDonante: toText(opportunity.donorCountry),
  tipoCooperacion: toText(opportunity.cooperationType),
  tipoOrganizacion: toText(opportunity.organizationType),
  tipoProyectos: toText(opportunity.projectType),
  poblacionesObjetivo: toTextList(opportunity.targetPopulations),
  formaPresentacion: toText(opportunity.applicationMethod),
  idioma: toText(opportunity.language),
  moneda: toText(opportunity.currency),
  valorEnPesos: toAmount(opportunity.amountInCop),
  portalOrigen: toText(opportunity.sourcePage),
  documentoFuente: toText(opportunity.sourceDocument),
  estado: toText(opportunity.opportunityStatus),
  detalleEstado: toText(opportunity.opportunityStatusDetail),
  contactoExterior: {
    persona: toText(opportunity.contactPerson),
    telefono: toText(opportunity.contactPhone),
    fax: toText(opportunity.contactFax),
    direccion: toText(opportunity.contactAddress),
    ciudad: toText(opportunity.contactCity),
    email: toText(opportunity.contactEmail),
  },
  contactoColombia: {
    persona: toText(opportunity.localContactPerson),
    telefono: toText(opportunity.localContactPhone),
    direccion: toText(opportunity.localContactAddress),
    ciudad: toText(opportunity.localContactCity),
    email: toText(opportunity.localContactEmail),
  },
  observaciones: toText(opportunity.notes),
});
