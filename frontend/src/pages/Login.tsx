// src/pages/Login.tsx

import { useState } from "react";

import { z } from "zod";

import { loginService, registerService } from "@/services/auth/user.service";

import { ApiError, getGenericErrorMessage } from "@/lib/api-error";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

// =========================
// SCHEMAS
// Limites iguais aos do backend. Política de senha só no cadastro.
// =========================

const EMAIL_MAX = 254;
const NAME_MAX = 120;
const PASSWORD_MAX_BYTES = 72;

// Senhas comuns, comparadas sem diferenciar maiúsculas (iguais ao servidor).
const COMMON_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "87654321",
  "password",
  "password1",
  "senha123",
  "qwerty123",
  "abcd1234",
  "11111111",
  "00000000",
]);

// Controle (U+0000 a U+001F e U+007F) e surrogates isolados. Texto de uma linha não aceita nenhum.
function hasInvalidText(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);

    if (code < 0x20 || code === 0x7f) return true;

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        i++;
        continue;
      }
      return true;
    }

    if (code >= 0xdc00 && code <= 0xdfff) return true;
  }

  return false;
}

// E-mail: trim e minúsculas antes de validar e enviar.
const emailSchema = z
  .string("Informe o e-mail")
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail")
  .max(EMAIL_MAX, "O e-mail deve ter no máximo 254 caracteres")
  .pipe(z.email("E-mail inválido"));

// Política de senha só no cadastro. Não faz trim: espaços fazem parte da senha.
const passwordPolicySchema = z
  .string("Informe a senha")
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .refine(
    (value) => new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES,
    "A senha é longa demais",
  )
  .refine((value) => value.trim() !== "", "A senha não pode ser só espaços")
  .refine((value) => !value.includes("\u0000"), "A senha contém caracteres inválidos")
  .refine(
    (value) => !COMMON_PASSWORDS.has(value.toLowerCase()),
    "Escolha uma senha menos comum",
  );

const loginSchema = z.object({
  email: emailSchema,

  password: z.string("Informe a senha").min(1, "Informe a senha"),
});

const registerSchema = z
  .object({
    name: z
      .string("Informe o nome")
      .trim()
      .normalize("NFC")
      .min(3, "O nome deve ter no mínimo 3 caracteres")
      .max(NAME_MAX, "O nome deve ter no máximo 120 caracteres")
      .refine((value) => !hasInvalidText(value), "O nome contém caracteres inválidos"),

    email: emailSchema,

    password: passwordPolicySchema,

    confirmPassword: z.string(),
  })

  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
      });
    }
  });

type FieldErrors = Record<string, string>;

// Campos mostrados junto ao input. Erros de outros campos vão para o aviso acima do botão.
const FORM_FIELDS = ["email", "name", "password", "confirmPassword"];

// Primeira mensagem de cada campo do zod.
function zodFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");

    if (!Object.hasOwn(errors, key)) errors[key] = issue.message;
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-red-600">{message}</p>;
}

export function Login() {
  // =========================
  // STATES
  // =========================

  const [email, setEmail] = useState("");

  const [name, setName] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [createAccount, setCreateAccount] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [formError, setFormError] = useState("");

  const [formSuccess, setFormSuccess] = useState("");

  // =========================
  // HELPERS
  // =========================

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };

      delete next[field];

      return next;
    });
  }

  // Erros por campo da API ficam perto do campo; o que não couber em um campo aparece acima do botão.
  function showApiError(error: unknown, fallback: string) {
    if (!(error instanceof ApiError)) {
      setFormError(fallback);

      return;
    }

    setFieldErrors(error.fields);

    setFormError(
      getGenericErrorMessage(error, fallback, FORM_FIELDS) ?? "",
    );
  }

  function resetMessages() {
    setFieldErrors({});

    setFormError("");

    setFormSuccess("");
  }

  // =========================
  // LOGIN
  // =========================

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    resetMessages();

    const result = loginSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));

      return;
    }

    try {
      setLoading(true);

      await loginService(result.data);

      // =========================
      // CHROME EXTENSION FIX
      // =========================

      window.location.href = "index.html";
    } catch (error) {
      console.error(error);

      showApiError(error, "Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // REGISTER
  // =========================

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    resetMessages();

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));

      return;
    }

    try {
      setLoading(true);

      await registerService({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });

      setFormSuccess("Cadastro realizado com sucesso");

      setCreateAccount(false);

      setName("");

      setEmail("");

      setPassword("");

      setConfirmPassword("");
    } catch (error) {
      console.error(error);

      showApiError(error, "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        flex min-h-screen w-full
        items-center justify-center
        bg-zinc-100
        p-4
      "
    >
      <Card
        className="
          w-full max-w-sm
          rounded-2xl
          border-zinc-200
          shadow-lg
        "
      >
        <CardContent
          className="
            flex flex-col gap-6
            p-6
          "
        >
          {/* HEADER */}
          <div
            className="
              flex flex-col items-center
              justify-center gap-1
              text-center
            "
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-6">
                <img src="/icons/icon.png" alt="Chat2Order" />
              </div>

              <h1
                className="
                  text-2xl
                  font-bold
                  text-zinc-900
                "
              >
                Bem-vindo
              </h1>
            </div>

            <p className="text-sm text-zinc-500">
              {createAccount
                ? "Crie sua conta para continuar"
                : "Entre com sua conta para continuar"}
            </p>
          </div>

          {/* FORM */}
          <form
            noValidate
            onSubmit={createAccount ? handleRegister : handleLogin}
            className="flex flex-col gap-4"
          >
            {/* EMAIL */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="
                  text-sm
                  font-medium
                  text-zinc-700
                "
              >
                Email
              </label>

              <Input
                id="email"
                type="email"
                placeholder="seuemail@empresa.com"
                maxLength={EMAIL_MAX}
                value={email}
                aria-invalid={!!fieldErrors.email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  clearFieldError("email");
                }}
              />

              <FieldError message={fieldErrors.email} />
            </div>

            {/* NAME */}
            {createAccount && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="
                    text-sm
                    font-medium
                    text-zinc-700
                  "
                >
                  Nome completo
                </label>

                <Input
                  id="name"
                  type="text"
                  placeholder="César Danilo"
                  maxLength={NAME_MAX}
                  value={name}
                  aria-invalid={!!fieldErrors.name}
                  onChange={(e) => {
                    setName(e.target.value);

                    clearFieldError("name");
                  }}
                />

                <FieldError message={fieldErrors.name} />
              </div>
            )}

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="
                  text-sm
                  font-medium
                  text-zinc-700
                "
              >
                Senha
              </label>

              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                maxLength={createAccount ? PASSWORD_MAX_BYTES : undefined}
                value={password}
                aria-invalid={!!fieldErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  clearFieldError("password");
                }}
              />

              <FieldError message={fieldErrors.password} />
            </div>

            {/* CONFIRM PASSWORD */}
            {createAccount && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="
                    text-sm
                    font-medium
                    text-zinc-700
                  "
                >
                  Confirmar senha
                </label>

                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite novamente sua senha"
                  maxLength={PASSWORD_MAX_BYTES}
                  value={confirmPassword}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    clearFieldError("confirmPassword");
                  }}
                />

                <FieldError message={fieldErrors.confirmPassword} />
              </div>
            )}

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}

            {formSuccess && (
              <p role="status" className="text-sm text-emerald-700">
                {formSuccess}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-emerald-600
                  hover:bg-emerald-700
                "
              >
                {loading
                  ? createAccount
                    ? "Cadastrando..."
                    : "Entrando..."
                  : createAccount
                    ? "Criar conta"
                    : "Entrar"}
              </Button>

              <button
                type="button"
                className="
                  mt-2
                  cursor-pointer
                  text-sm
                  text-zinc-600
                  transition-colors
                  hover:text-zinc-900
                "
                onClick={() => {
                  setCreateAccount(!createAccount);

                  resetMessages();
                }}
              >
                {createAccount ? "Já tenho uma conta" : "Criar conta"}
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <p
            className="
              text-center
              text-xs
              text-zinc-400
            "
          >
            Chat2Order • Plataforma segura
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
