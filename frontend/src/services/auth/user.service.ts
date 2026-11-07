import { readApiError } from "@/lib/api-error";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Body de POST /api/user: somente name, email e password.
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function loginService({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> {

  const response = await fetch(
    import.meta.env.VITE_API_URL + "/auth/login",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    // 401 (INVALID_CREDENTIALS) usa a mensagem do servidor.
    throw await readApiError(response, "Erro ao realizar login");
  }

  const data: LoginResponse = await response.json();

  localStorage.setItem("token", data.token);

  return data;
}

export async function registerService({ email, name, password }: RegisterRequest): Promise<void> {
  const response = await fetch(import.meta.env.VITE_API_URL + "/user", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw await readApiError(response, "Erro ao realizar cadastro");
  }
}
