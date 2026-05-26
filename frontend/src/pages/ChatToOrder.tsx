import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Loader2,
  SquareArrowRightEnter,
  SquareArrowRightExit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import icon from "../../src/assets/icon.png";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  status: string;
  total: number;
  source: string;
  rawMessage: string;
  createdAt: string;
  items: OrderItem[];
};

function OrderSkeleton() {
  return (
    <div className="w-[380px] rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-full" />

          <Skeleton className="h-5 w-40 rounded-xl" />

          <Skeleton className="h-4 w-28 rounded-xl" />
        </div>

        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-20 rounded-full" />

        <Skeleton className="h-4 w-full rounded-xl" />

        <Skeleton className="h-4 w-2/3 rounded-xl" />
      </div>

      <div className="mt-5 space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-xl" />

            <Skeleton className="h-4 w-16 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <Skeleton className="h-4 w-14 rounded-xl" />

        <Skeleton className="h-6 w-24 rounded-xl" />
      </div>
    </div>
  );
}

function ChatToOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const openDashboard = () => {
    chrome.tabs.create({
      url: "http://localhost:5173",
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
              const errorData = await apiResponse.json();

              throw new Error(
                errorData.error || "A IA está temporariamente indisponível.",
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

            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Erro ao importar conversa.",
            );
          } finally {
            setLoading(false);
          }
        },
      );
    });
  };

  const handleExit = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex flex-col items-center px-4 py-6 gap-5">
      {/* HEADER */}
      <div className="w-[380px] rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
              <img src={icon} alt="Chat2Order" className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-base font-semibold text-zinc-900">
                Chat2Order
              </h1>

              <p className="text-xs text-zinc-500">
                Importação inteligente de pedidos
              </p>
            </div>
          </div>

          <button
            onClick={handleExit}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-zinc-100"
          >
            <SquareArrowRightExit size={18} className="text-zinc-500" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm leading-relaxed text-zinc-600">
            Importe conversas do WhatsApp Web e transforme automaticamente em
            pedidos organizados.
          </p>

          <div className="space-y-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                1
              </span>

              <p>Abra o WhatsApp Web</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                2
              </span>

              <p>Clique em importar conversa</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                3
              </span>

              <p>O pedido será gerado automaticamente</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleImport}
          disabled={loading}
          className="mt-5 h-11 w-full cursor-pointer rounded-2xl bg-emerald-600 transition-all hover:bg-emerald-700 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Importando conversa...
            </>
          ) : (
            <>
              <SquareArrowRightEnter size={16} />
              Importar conversa
            </>
          )}
        </Button>

        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Processamento seguro • Dados não compartilhados
        </p>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="w-[380px] rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-red-700">
              IA temporariamente indisponível
            </span>

            <p className="text-xs leading-relaxed text-red-600">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* SKELETON */}
      {loading && (
        <>
          {Array.from({ length: 2 }).map((_, index) => (
            <OrderSkeleton key={index} />
          ))}
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 && (
        <div className="w-[380px] rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
            <SquareArrowRightEnter size={20} className="text-zinc-500" />
          </div>

          <h2 className="text-sm font-medium text-zinc-700">
            Nenhum pedido importado
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Os pedidos importados aparecerão aqui automaticamente.
          </p>
        </div>
      )}

      {/* ORDERS */}
      {!loading &&
        orders.map((order) => (
          <div
            key={order.id}
            className="w-[380px] rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Cliente</p>

                <h2 className="font-medium text-zinc-900">
                  {order.customerName}
                </h2>

                <p className="text-sm text-zinc-500">{order.customerPhone}</p>
              </div>

              <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {order.paymentMethod}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-zinc-500">Endereço</p>

              <p className="text-sm leading-relaxed text-zinc-700">
                {order.address}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-700">
                    {item.quantity}x {item.productName}
                  </span>

                  <span className="font-medium text-zinc-900">
                    R$ {item.totalPrice}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="text-sm text-zinc-500">Total</span>

              <span className="text-xl font-bold text-emerald-600">
                R$ {order.total}
              </span>
            </div>
          </div>
        ))}

      {/* FOOTER */}
      <Button
        variant="outline"
        onClick={openDashboard}
        className="h-11 rounded-2xl px-6"
      >
        Ver todos os pedidos
      </Button>
    </div>
  );
}

export default ChatToOrder;
