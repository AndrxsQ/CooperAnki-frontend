const responsibleLawyers = ["Laura Méndez", "Andrés Torres", "Camila Ríos"];
const caseStatuses = ["En curso", "Pendiente", "Cerrado"];

export const createTemporaryLegalClients = (units) => {
  const sortedUnits = [...units].sort((first, second) =>
    String(first.name ?? "").localeCompare(String(second.name ?? ""), "es"),
  );
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return sortedUnits.map((unit, index) => {
    const sequence = String(index + 1).padStart(4, "0");
    const activityDate = new Date(today);
    activityDate.setDate(today.getDate() - index * 2);

    return {
      ...unit,
      caseNumber: `EXP-${today.getFullYear()}-${sequence}`,
      filingNumber: `11001-31-03-${String((index % 10) + 1).padStart(3, "0")}-${today.getFullYear()}-${sequence}`,
      status: caseStatuses[index % caseStatuses.length],
      responsible: responsibleLawyers[index % responsibleLawyers.length],
      lastActivityAt: activityDate.toISOString().slice(0, 10),
    };
  });
};
