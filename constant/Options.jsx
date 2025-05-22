// Opciones de controles de niño sano (en español) con campos de formulario para cada control
const healthControls = [
  {
    label: "Diada (antes de los 10 días)",
    professional: "Matrona",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "lactancia", label: "Lactancia materna exclusiva", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
  {
    label: "1 mes",
    professional: "Médico",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "vacunas", label: "Vacunas aplicadas", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
  {
    label: "2 meses",
    professional: "Enfermera",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "vacunas", label: "Vacunas aplicadas", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
  {
    label: "3 meses",
    professional: "Médico",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "observaciones", label: "Observaciones", type: "text" },
      { key: "radiografia_cadera", label: "Radiografía de cadera", type: "text" },
    ],
  },
  {
    label: "4 meses",
    professional: "Enfermera",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "vacunas", label: "Vacunas aplicadas", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
  {
    label: "Consulta nutricional al 5° mes",
    professional: "Nutricionista",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "alimentacion", label: "Alimentación", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
  {
    label: "6 meses",
    professional: "Pediatra/Enfermera",
    fields: [
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "talla", label: "Talla (cm)", type: "number" },
      { key: "vacunas", label: "Vacunas aplicadas", type: "text" },
      { key: "alimentacion", label: "Alimentación complementaria", type: "text" },
      { key: "observaciones", label: "Observaciones", type: "text" },
    ],
  },
// ...continúa agregando los campos relevantes para cada control...
{
    label: "8 meses",
    professional: "Pediatra/Enfermera",
    fields: [
        { key: "peso", label: "Peso (kg)", type: "number" },
        { key: "talla", label: "Talla (cm)", type: "number" },
        { key: "eedp", label: "EEDP (Escala de Evaluación del Desarrollo Psicomotor)", type: "text" },
        { key: "observaciones", label: "Observaciones", type: "text" },
    ],
},
{
    label: "12 meses",
    professional: "Pediatra/Enfermera",
    fields: [
        { key: "peso", label: "Peso (kg)", type: "number" },
        { key: "talla", label: "Talla (cm)", type: "number" },
        { key: "vacunas", label: "Vacunas aplicadas", type: "text" },
        { key: "eedp", label: "EEDP (Escala de Evaluación del Desarrollo Psicomotor)", type: "text" },
        { key: "observaciones", label: "Observaciones", type: "text" },
    ],
},
  // ...agrega el resto de los controles siguiendo el mismo formato...
];

export default healthControls;