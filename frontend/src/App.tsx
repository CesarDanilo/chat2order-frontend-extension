import { useState } from "react";
import { Button } from "@/components/ui/button";

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

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const openDashboard = () => {
    chrome.tabs.create({
      url: "https://seusite.com"
    });
  };

  const handleImport = () => {
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
            return;
          }

          try {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NWMzNDEzNi05ZmNkLTQyYjYtYWE4ZS03NzFkZjdhMGZmZDkiLCJpYXQiOjE3Nzg3MTIzMjAsImV4cCI6MTc3ODc5ODcyMH0.Myqx4UpCgz2uFAUAJKEjAIjDvVUAu0LL5yiXvyu0UA0";

            const apiResponse = await fetch("http://127.0.0.1:3000/api/parse", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                message: response.conversation.join("\n")
              })
            });

            if (!apiResponse.ok) {
              throw new Error("Erro na API");
            }

            const order: Order = await apiResponse.json();

            setOrders((prev) => [...prev, order]);

          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }
      );
    });
  };

  return (
    <div className="w-full p-4 bg-zinc-100 min-h-screen flex flex-col items-center gap-4">

      {/* CARD IMPORTAÇÃO */}
      <div className="w-[380px] bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
        <h1 className="text-lg font-semibold text-zinc-900">
          Chat2Order
        </h1>

        <Button
          onClick={handleImport}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? "Importando..." : "Importar Conversa"}
        </Button>
      </div>

      {/* CARD PEDIDOS */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="w-[380px] bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4"
        >
          <div>
            <p className="text-xs text-zinc-500">Cliente</p>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-zinc-500">{order.customerPhone}</p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Endereço</p>
            <p className="text-sm">{order.address}</p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Pagamento</p>
            <p className="text-sm">{order.paymentMethod}</p>
          </div>

          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span>R$ {item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span className="text-emerald-600">
              R$ {order.total}
            </span>
          </div>

        </div>
      ))}

      {orders.length > 0 && (
        <Button variant="outline" onClick={openDashboard}>
          Ver Todos os Pedidos
        </Button>
      )}

    </div>
  );
}

export default App;