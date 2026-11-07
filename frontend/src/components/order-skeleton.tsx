import { Skeleton } from "@/components/ui/skeleton";

// Placeholder de um pedido enquanto a conversa é analisada. Decorativo: o aviso de carregamento é lido pela região ao vivo.
export function OrderSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full rounded-2xl border border-border bg-card p-4 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
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

      <div className="mt-4 space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-32 rounded-xl" />

            <Skeleton className="h-4 w-16 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <Skeleton className="h-4 w-14 rounded-xl" />

        <Skeleton className="h-6 w-24 rounded-xl" />
      </div>
    </div>
  );
}
