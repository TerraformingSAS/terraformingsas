import { TerraMapa } from "@/components/terra/mapa/TerraMapa";
import { pageSeo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/mapa")({
  head: () =>
    pageSeo({
      title: "Mapa de lotes | TERRA Etapa I",
      description:
        "Mapa interactivo de TERRA Etapa I. Selecciona un lote para ver manzana, área y disponibilidad, y solicita una cotización.",
      path: "/terra/mapa",
      imagePath: "/terra/estado/ubicacion-etapa-i.webp",
    }),
  component: TerraMapa,
});
