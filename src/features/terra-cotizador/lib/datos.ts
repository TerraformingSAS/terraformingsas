import { useQuery } from "@tanstack/react-query";
import { fetchLotesYFecha } from "@/features/terra-cotizador/lib/lotes";
import { NoAutorizado } from "@/features/terra-cotizador/lib/auth";

export function useLotes() {
  return useQuery({
    queryKey: ["lotes"],
    queryFn: fetchLotesYFecha,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    retry: (n, e) => !(e instanceof NoAutorizado) && n < 1,
  });
}
