import { SquareArrowRightEnter } from "lucide-react";

// Estado vazio da lista de pedidos: explica o que vai aparecer aqui e como começar.
export function OrdersEmptyState() {
  return (
    <div className="flex w-full flex-col items-center rounded-2xl border border-dashed border-input bg-card px-6 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <SquareArrowRightEnter size={20} className="text-muted-foreground" aria-hidden="true" />
      </div>

      <h3 className="text-sm font-medium text-foreground">
        Nenhum pedido importado
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Os pedidos importados aparecerão aqui automaticamente.
      </p>
    </div>
  );
}
