import { LoginPage } from "@/features/terra-cotizador/pages/login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terra_/cotizador_/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceso al cotizador | TERRA" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CotizadorLoginRoute,
});

function CotizadorLoginRoute() {
  const dark =
    typeof window !== "undefined" &&
    (localStorage.getItem("terra-cotizador-tema") === "dark" ||
      (!localStorage.getItem("terra-cotizador-tema") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches));
  return (
    <div className={`terra-cotizador-app ${dark ? "dark" : "light"} bg-background text-foreground`}>
      <LoginPage />
    </div>
  );
}
