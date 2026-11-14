import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { peticionDinamica, useParametrosDinamicos } from "../lib/api";
import { validarParametrosDinamicos, type ParametrosDinamicos } from "../lib/parametros.ts";

export function ParametrosDinamicosPage() {
  const q = useParametrosDinamicos();
  return (
    <div id="trabajo" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link to="/terra/cotizador-dinamico" className="text-sm underline">
        Volver al cotizador dinámico
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Parámetros del cotizador dinámico</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Condiciones para nuevas cotizaciones. Las cotizaciones guardadas conservan sus valores
        originales.
      </p>
      {q.isPending ? (
        <p role="status" className="mt-6">
          Consultando parámetros…
        </p>
      ) : q.isError ? (
        <div role="alert" className="mt-6">
          <p>{q.error.message}</p>
          <Button className="mt-3" onClick={() => void q.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <ParametrosForm initial={q.data.parametros} />
      )}
    </div>
  );
}

function ParametrosForm({ initial }: { initial: ParametrosDinamicos }) {
  const [draft, setDraft] = useState({ ...initial, tasaMensual: initial.tasaMensual * 100 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();
  const fields = [
    ["separacionMinima", "Separación mínima (COP)", "1"],
    ["tasaMensual", "Tasa mensual vencida (%)", "0.01"],
    ["cuotaMensual", "Cuota mensual predeterminada (COP)", "1"],
    ["periodos", "Número de períodos predeterminado", "1"],
    ["maxPeriodos", "Máximo de períodos permitido (hasta 360)", "1"],
  ] as const;
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const parametros = validarParametrosDinamicos({
        ...draft,
        tasaMensual: draft.tasaMensual / 100,
      });
      setBusy(true);
      await peticionDinamica("parametros", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parametros),
      });
      await qc.invalidateQueries({ queryKey: ["parametros-dinamicos"] });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los parámetros.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="mt-6 space-y-5 rounded-xl border bg-card p-5">
      {fields.map(([key, label, step]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            className="text-base"
            id={key}
            type="number"
            required
            min={key.includes("eriodos") ? 1 : 0}
            max={key === "tasaMensual" ? 10 : key.includes("eriodos") ? 360 : 1e12}
            step={step}
            value={Number.isNaN(draft[key]) ? "" : draft[key]}
            onChange={(e) => {
              setDraft({ ...draft, [key]: e.target.value === "" ? NaN : Number(e.target.value) });
              setSaved(false);
            }}
          />
        </div>
      ))}
      <p className="text-sm text-muted-foreground">
        Estos parámetros se guardan de forma independiente a los del cotizador de cuotas fijas.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm">
          Parámetros guardados.
        </p>
      )}
      <Button disabled={busy} type="submit">
        {busy ? "Guardando…" : "Guardar parámetros"}
      </Button>
    </form>
  );
}
