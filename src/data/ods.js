export const odsGoals = [
  { id: 1, name: "Fin de la pobreza", color: "#e5243b" },
  { id: 2, name: "Hambre cero", color: "#dda63a" },
  { id: 3, name: "Salud y bienestar", color: "#4c9f38" },
  { id: 4, name: "Educación de calidad", color: "#c5192d" },
  { id: 5, name: "Igualdad de género", color: "#ff3a21" },
  { id: 6, name: "Agua limpia y saneamiento", color: "#26bde2" },
  { id: 7, name: "Energía asequible y no contaminante", color: "#fcc30b" },
  { id: 8, name: "Trabajo decente y crecimiento económico", color: "#a21942" },
  { id: 9, name: "Industria, innovación e infraestructura", color: "#fd6925" },
  { id: 10, name: "Reducción de las desigualdades", color: "#dd1367" },
  { id: 11, name: "Ciudades y comunidades sostenibles", color: "#fd9d24" },
  { id: 12, name: "Producción y consumo responsables", color: "#bf8b2e" },
  { id: 13, name: "Acción por el clima", color: "#3f7e44" },
  { id: 14, name: "Vida submarina", color: "#0a97d9" },
  { id: 15, name: "Vida de ecosistemas terrestres", color: "#56c02b" },
  { id: 16, name: "Paz, justicia e instituciones sólidas", color: "#00689d" },
  { id: 17, name: "Alianzas para lograr los objetivos", color: "#19486a" },
];

export const getOdsGoal = (id) => odsGoals.find((goal) => goal.id === Number(id));
