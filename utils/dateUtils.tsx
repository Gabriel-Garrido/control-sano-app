/**
 * Calcula la edad en años, meses y días desde birthDate hasta hoy.
 * @param {Date|{toDate:Function}|{seconds:number}} birthDate
 * @returns {string} Ejemplo: "1 año, 2 meses y 28 días"
 */
export function calculateAge(
  birthDate: Date | { toDate: () => Date } | { seconds: number }
) {
  if (!birthDate) return "";
  let date;
  if (typeof (birthDate as any).toDate === "function") {
    date = (birthDate as { toDate: () => Date }).toDate();
  } else if (typeof (birthDate as any).seconds === "number") {
    date = new Date((birthDate as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(birthDate as Date);
  }
  const today = new Date();

  let years = today.getFullYear() - date.getFullYear();
  let months = today.getMonth() - date.getMonth();
  let days = today.getDate() - date.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let ageStr = "";
  if (years > 0) ageStr += `${years} año${years > 1 ? "s" : ""}`;
  if (months > 0) ageStr += `${ageStr ? ", " : ""}${months} mes${months > 1 ? "es" : ""}`;
  if (days > 0 || (!years && !months)) ageStr += `${ageStr ? " y " : ""}${days} día${days !== 1 ? "s" : ""}`;
  return ageStr;
}

/**
 * Convierte un objeto Firestore o Date a una cadena de fecha local en español.
 * @param {Date|{toDate:Function}|{seconds:number}} date
 * @returns {string}
 */
export function dateToLocaleString(date: Date | { toDate: () => Date } | { seconds: number }) {
  if (!date) return "";
  let d: Date;
  if (typeof (date as any).toDate === "function") {
    d = (date as { toDate: () => Date }).toDate();
  } else if (typeof (date as any).seconds === "number") {
    d = new Date((date as { seconds: number }).seconds * 1000);
  } else {
    d = new Date(date as Date);
  }
  return d.toLocaleDateString("es-ES");
}