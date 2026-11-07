import type { Order } from "@/types/order";
import { currencyFormatter, formatPhone } from "@/lib/formatters";

// Cartão de um pedido importado. Itens longos quebram linha em vez de estourar a largura do painel.
export function OrderCard({ order }: { order: Order }) {
  return (
    <li className="w-full rounded-2xl border border-border bg-card p-4 shadow-xs">
      <article className="flex flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Cliente</p>

            <h3 className="break-words font-medium text-foreground">
              {order.customerName}
            </h3>

            <p className="text-sm text-muted-foreground">
              {formatPhone(order.customerPhone)}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {order.paymentMethod}
          </span>
        </header>

        <div>
          <p className="text-xs text-muted-foreground">Endereço</p>

          <p className="break-words text-sm leading-relaxed text-foreground">
            {order.address}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="min-w-0 break-words text-foreground">
                {item.quantity}x {item.productName}
              </span>

              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {currencyFormatter.format(item.totalPrice)}
              </span>
            </li>
          ))}
        </ul>

        <footer className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>

          <span className="text-xl font-bold tabular-nums text-primary">
            {currencyFormatter.format(order.total)}
          </span>
        </footer>
      </article>
    </li>
  );
}
