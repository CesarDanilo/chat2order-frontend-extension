export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Mesma regra do frontend (formatPhone em src/lib/formatters.ts).
// Vazio vira "-"; "+..." fica como está; 00000000000 é "não informado"; 10 e 11 dígitos ganham máscara.
export function formatPhone(value?: string): string {
  const text = (value ?? "").trim();
  if (text === "") return "-";
  if (text.startsWith("+")) return text;

  const digits = text.replace(/\D/g, "");
  if (digits === "00000000000") return "Não informado";
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return text;
}
