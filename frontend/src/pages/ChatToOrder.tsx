import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Loader2,
  SquareArrowRightEnter,
  SquareArrowRightExit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/form-feedback";
import { OrderCard } from "@/components/order-card";
import { OrderSkeleton } from "@/components/order-skeleton";
import { OrdersEmptyState } from "@/components/orders-empty-state";

import { ApiError, getGenericErrorMessage, readApiError } from "@/lib/api-error";
import type { Order } from "@/types/order";

import icon from "../../src/assets/icon.png";

const IMPORT_STEPS = [
  "Abra o WhatsApp Web",
  "Clique em importar conversa",
  "O pedido será gerado automaticamente",
];

function ChatToOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const openDashboard = () => {
    chrome.tabs.create({
      url: import.meta.env.VITE_DASHBOARD_URL,
    });
  };

  const handleImport = () => {
    setErrorMessage("");
    setLoading(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        setLoading(false);
        return;
      }

      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "IMPORT_CONVERSATION" },
        async (response) => {
          if (chrome.runtime.lastError || !response?.conversation) {
            setLoading(false);

            setErrorMessage(
              "Não foi possível capturar a conversa do WhatsApp.",
            );

            return;
          }

          try {
            const token = localStorage.getItem("token");

            const apiResponse = await fetch(
              import.meta.env.VITE_API_URL + "/parse",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  message: response.conversation.join("\n"),
                }),
              },
            );

            if (!apiResponse.ok) {
              // Usa `message` da API; corpo que não é JSON cai na mensagem genérica.
              throw await readApiError(
                apiResponse,
                "Não foi possível importar a conversa. Tente novamente.",
              );
            }

            const order: Order = await apiResponse.json();

            setOrders((prev) => {
              const alreadyExists = prev.some((item) => item.id === order.id);

              if (alreadyExists) {
                return prev;
              }

              return [order, ...prev];
            });
          } catch (error) {
            console.error(error);

            // Erro da API: sem campos na tela, então vai a primeira mensagem de `details` (ou a da API).
            const message =
              error instanceof ApiError
                ? getGenericErrorMessage(error, "Erro ao importar conversa.")
                : error instanceof Error
                  ? error.message
                  : "Erro ao importar conversa.";

            setErrorMessage(message ?? "Erro ao importar conversa.");
          } finally {
            setLoading(false);
          }
        },
      );
    });
  };

  const handleExit = () => {
    const token = localStorage.getItem("token");

    // Encerra a sessão também no servidor. Sem rede, o token só expira no prazo normal.
    if (token) {
      fetch(import.meta.env.VITE_API_URL + "/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined);
    }

    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-accent">
              <img src={icon} alt="" aria-hidden="true" className="size-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight text-foreground">
                Chat2Order
              </h1>

              <p className="text-xs leading-snug text-muted-foreground">
                Importação inteligente de pedidos
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleExit}
            aria-label="Sair da conta"
            title="Sair da conta"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <SquareArrowRightExit aria-hidden="true" />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
        {/* IMPORT */}
        <section
          aria-label="Importar conversa"
          className="rounded-2xl border border-border bg-card p-4 shadow-xs"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Importe conversas do WhatsApp Web e transforme automaticamente em
            pedidos organizados.
          </p>

          <ol className="mt-4 flex flex-col gap-2 rounded-xl bg-muted/60 p-3 text-sm text-foreground">
            {IMPORT_STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-foreground"
                >
                  {index + 1}
                </span>

                <span>{step}</span>
              </li>
            ))}
          </ol>

          <Button
            onClick={handleImport}
            disabled={loading}
            aria-busy={loading}
            className="mt-4 h-11 w-full rounded-xl text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Importando conversa...
              </>
            ) : (
              <>
                <SquareArrowRightEnter aria-hidden="true" />
                Importar conversa
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            A conversa é enviada ao Chat2Order e analisada por IA (Groq). O texto fica salvo junto ao pedido.
          </p>
        </section>

        {/* ERROR */}
        {errorMessage && (
          <FormAlert>
            <p className="font-medium">Não foi possível importar a conversa</p>

            <p className="mt-0.5 text-xs leading-relaxed">{errorMessage}</p>
          </FormAlert>
        )}

        {/* ORDERS */}
        <section aria-labelledby="pedidos-titulo" aria-busy={loading} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="pedidos-titulo" className="text-sm font-semibold text-foreground">
              Pedidos importados
            </h2>

            {orders.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {orders.length}
              </span>
            )}
          </div>

          {/* Anuncia o carregamento para leitores de tela. */}
          <div aria-live="polite" className="sr-only">
            {loading ? "Importando conversa, aguarde." : ""}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <OrderSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && orders.length === 0 && <OrdersEmptyState />}

          {!loading && orders.length > 0 && (
            <ul className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mx-auto w-full max-w-md px-4 pb-6">
        <Button
          variant="outline"
          onClick={openDashboard}
          className="h-11 w-full rounded-xl"
        >
          Ver todos os pedidos
        </Button>
      </footer>
    </div>
  );
}

export default ChatToOrder;
