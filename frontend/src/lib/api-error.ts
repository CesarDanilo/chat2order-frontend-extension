// Tratamento de erro de API da extensão.
// Contrato: { error: { code, message, details?: [{ field, code, message }] } }.
// `details` só existe em erros de validação. `field` pode ser aninhado (items.0.quantity) ou vazio.

export class ApiError extends Error {
  readonly status: number;
  // Código do contrato (ex.: INVALID_CREDENTIALS). Vazio se a API não enviou.
  readonly code: string;
  // Primeira mensagem por campo (campo pode ser aninhado ou vazio).
  // EMAIL_TAKEN também entra aqui, no campo `email`.
  readonly fields: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields: Record<string, string> = {},
    code: string = "",
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Lê a resposta de erro. Corpo que não é JSON ou sem `error.message` usa a mensagem de reserva.
export async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);

  const error = isRecord(body) && isRecord(body.error) ? body.error : {};

  const message =
    typeof error.message === "string" && error.message.trim() !== ""
      ? error.message
      : fallback;

  const code = typeof error.code === "string" ? error.code : "";

  const fields: Record<string, string> = {};

  if (Array.isArray(error.details)) {
    for (const detail of error.details) {
      if (
        isRecord(detail) &&
        typeof detail.field === "string" &&
        typeof detail.message === "string" &&
        detail.message !== "" &&
        !Object.hasOwn(fields, detail.field)
      ) {
        fields[detail.field] = detail.message;
      }
    }
  }

  // E-mail já cadastrado: a mensagem do servidor vai para o campo de e-mail.
  if (code === "EMAIL_TAKEN" && !Object.hasOwn(fields, "email")) {
    fields.email = message;
  }

  return new ApiError(response.status, message, fields, code);
}

// Mensagem para toast/alerta genérico. Sem details, é a mensagem da API.
// Com details, é a primeira que NÃO couber em um campo exibido (shownFields).
// Retorna null quando todos os erros já aparecem junto aos campos (evita repetir).
export function getGenericErrorMessage(
  error: unknown,
  fallback: string,
  shownFields: readonly string[] = [],
): string | null {
  if (!(error instanceof ApiError)) return fallback;

  const keys = Object.keys(error.fields);
  if (keys.length === 0) return error.message;

  const unplaced = keys.find((key) => !shownFields.includes(key));

  return unplaced === undefined ? null : error.fields[unplaced];
}
