import { useState } from "react";
import { Button } from "@/components/ui/button";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  restaurant: string;
  items: OrderItem[];
  total: number;
};

function App() {
  // ✔ Agora estamos trabalhando com múltiplos pedidos corretamente
  const [orders, setOrders] = useState<Order[]>([]);

  const openDashboard = () => {
    chrome.tabs.create({
      url: "https://seusite.com"
    });
  };

  const handleImport = () => {
    // ✔ Agora o tipo bate com o state (Order[])
    const mockOrders: Order[] = [
      {
        restaurant: "Pizza Express",
        items: [
          { name: "Pizza Margherita", quantity: 1, price: 42 },
          { name: "Refrigerante", quantity: 2, price: 8 }
        ],
        total: 58
      },
      {
        restaurant: "Burger House",
        items: [
          { name: "Hambúrguer", quantity: 2, price: 25 }
        ],
        total: 50
      },
      {
        restaurant: "Burger House",
        items: [
          { name: "Hambúrguer", quantity: 2, price: 25 }
        ],
        total: 50
      },
      {
        restaurant: "Burger House",
        items: [
          { name: "Hambúrguer", quantity: 2, price: 25 }
        ],
        total: 50
      }
    ];

    setOrders(mockOrders);
  };

  return (
    <div className="w-full p-4 bg-zinc-100 min-h-screen flex flex-col justify-center items-center gap-4">

      {/* 🔹 CARD DE IMPORTAÇÃO */}
      <div className="w-[380px] bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
        <h1 className="text-lg font-semibold text-zinc-900">
          Chat2Order
        </h1>

        <p className="text-sm text-zinc-500">
          Clique em importar para gerar os pedidos.
        </p>

        <Button
          onClick={handleImport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Importar Conversa
        </Button>
      </div>

      {/* 🔹 CARD DOS PEDIDOS */}
      {orders.length > 0 && (
        <div className="w-[380px] bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-6">

          {orders.map((order, orderIndex) => (
            <div key={orderIndex} className="flex flex-col gap-4">

              <div>
                <p className="text-xs text-zinc-500">Restaurante</p>
                <p className="font-medium text-zinc-800">
                  {order.restaurant}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-zinc-700"
                  >
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>R$ {item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t pt-3 text-sm font-semibold">
                <span>Total</span>
                <span className="text-emerald-600">
                  R$ {order.total}
                </span>
              </div>

            </div>
          ))}

          <Button
            variant="outline"
            onClick={openDashboard}
          >
            Ver Todos os Pedidos
          </Button>

        </div>
      )}

    </div>
  );
}

export default App;