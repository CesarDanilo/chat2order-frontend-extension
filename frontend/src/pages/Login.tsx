// src/pages/Login.tsx

import { useState } from "react";

import { z } from "zod";

import { Loader2 } from "lucide-react";

import { loginService, registerService } from "@/services/auth/user.service";

import { ApiError, getGenericErrorMessage } from "@/lib/api-error";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { FieldError, FormAlert } from "@/components/form-feedback";

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

const LABEL_CLASS = "text-sm font-medium text-foreground";

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
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm gap-0 rounded-2xl py-0 shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6">
          {/* HEADER */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-accent">
              <img src="/icons/icon.png" alt="" aria-hidden="true" className="size-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Bem-vindo
              </h1>

              <p className="text-sm text-muted-foreground">
                {createAccount
                  ? "Crie sua conta para continuar"
                  : "Entre com sua conta para continuar"}
              </p>
            </div>
          </div>

          {/* FORM */}
          <form
            noValidate
            aria-busy={loading}
            onSubmit={createAccount ? handleRegister : handleLogin}
            className="flex flex-col gap-4"
          >
            {/* EMAIL */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={LABEL_CLASS}>
                Email
              </label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seuemail@empresa.com"
                maxLength={EMAIL_MAX}
                value={email}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);

                  clearFieldError("email");
                }}
              />

              <FieldError id="email-error" message={fieldErrors.email} />
            </div>

            {/* NAME */}
            {createAccount && (
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Nome completo
                </label>

                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="César Danilo"
                  maxLength={NAME_MAX}
                  value={name}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  onChange={(e) => {
                    setName(e.target.value);

                    clearFieldError("name");
                  }}
                />

                <FieldError id="name-error" message={fieldErrors.name} />
              </div>
            )}

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className={LABEL_CLASS}>
                Senha
              </label>

              <Input
                id="password"
                type="password"
                autoComplete={createAccount ? "new-password" : "current-password"}
                placeholder="Digite sua senha"
                maxLength={createAccount ? PASSWORD_MAX_BYTES : undefined}
                value={password}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                onChange={(e) => {
                  setPassword(e.target.value);

                  clearFieldError("password");
                }}
              />

              <FieldError id="password-error" message={fieldErrors.password} />
            </div>

            {/* CONFIRM PASSWORD */}
            {createAccount && (
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  Confirmar senha
                </label>

                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Digite novamente sua senha"
                  maxLength={PASSWORD_MAX_BYTES}
                  value={confirmPassword}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={
                    fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    clearFieldError("confirmPassword");
                  }}
                />

                <FieldError
                  id="confirmPassword-error"
                  message={fieldErrors.confirmPassword}
                />
              </div>
            )}

            {formError && <FormAlert>{formError}</FormAlert>}

            {formSuccess && (
              <p
                role="status"
                className="rounded-xl border border-primary/30 bg-accent px-3 py-2 text-sm text-accent-foreground"
              >
                {formSuccess}
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-xl text-sm"
              >
                {loading && <Loader2 className="animate-spin" aria-hidden="true" />}

                {loading
                  ? createAccount
                    ? "Cadastrando..."
                    : "Entrando..."
                  : createAccount
                    ? "Criar conta"
                    : "Entrar"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-9 w-full text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setCreateAccount(!createAccount);

                  resetMessages();
                }}
              >
                {createAccount ? "Já tenho uma conta" : "Criar conta"}
              </Button>
            </div>
          </form>

          {/* FOOTER */}
          <p className="text-center text-xs text-muted-foreground">
            Chat2Order • Plataforma segura
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
