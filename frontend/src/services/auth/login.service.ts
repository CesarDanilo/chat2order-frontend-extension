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

    const error = await response.json();

    throw new Error(
      error.message || "Erro ao realizar login"
    );
  }

  const data = await response.json();

  localStorage.setItem("token", data.token);

  return data;
}