export function fechaCorta(value: string): string {
  if (value.includes("T")) {
    return new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }
  return value.split("-").reverse().join("/");
}
