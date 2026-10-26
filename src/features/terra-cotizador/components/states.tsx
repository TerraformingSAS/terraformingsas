import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-medium">{title}</p>
    </div>
  );
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}
