// src/pages/Login.tsx

import { useState } from "react";

import { z } from "zod";
import { loginService } from "@/services/auth/login.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import icon from "../../src/assets/icon.png";

interface UserData {
  email: string;
  password: string;
  confirm_password?: string;
}

export function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  const User = z.object({
    email: z.string().email,
    password: z.string().min(8),
    confirm_password: z.string().min(8),
  })

  async function CheckUserTypes(data: UserData) {
    try {
      const result = User.safeParse(data);
      return result.success;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues;
      }
    }
  }


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const isValid = await CheckUserTypes({ email, password });

      if (!isValid) {
        alert("Email ou senha inválidos");
      }

      await loginService({ email, password });
      window.location.href = "/";

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-zinc-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-sm rounded-2xl shadow-lg border-zinc-200">

        <CardContent className="p-6 flex flex-col justify-center gap-6">

          <div className="flex flex-col justify-center items-center gap-1 text-center">
            <div className="flex justify-center items-center gap-2">
              <div className="w-6">
                <img src={icon} alt="logo" />
              </div>

              <h1 className="text-2xl font-bold text-zinc-900">
                Bem-vindo
              </h1>
            </div>


            <p className="text-sm text-zinc-500">
              Entre com sua conta para continuar
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >

            <div className="flex flex-col gap-2">

              <label className="text-sm font-medium text-zinc-700">
                Email
              </label>

              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            <div className="flex flex-col gap-2">

              <label className="text-sm font-medium text-zinc-700">
                Senha
              </label>

              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
              {createAccount &&
                <Input
                  type="password"
                  placeholder="Digite novamente sua senha"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              }

            </div>

            <div className="flex-col" >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <span className="mt-2 flex items-center justify-center cursor-pointer" onClick={() => setCreateAccount(!createAccount)}>{createAccount ? "Já tenho uma conta" :  "Criar conta" }</span>
            </div>
          </form>

          <p className="text-center text-xs text-zinc-400">
            Chat2Order • Plataforma segura
          </p>

        </CardContent>

      </Card>

    </div>
  );
}