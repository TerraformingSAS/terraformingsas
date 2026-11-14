import type { Ref } from "react";
import { fmtCOP, fmtNum } from "../../terra-cotizador/lib/lotes";
import type { CotizacionDinamica } from "../lib/types.ts";
import logo from "../../terra-cotizador/assets/terraforming-logo-dark.png";
import { fechaCorta } from "../lib/formato";

export function PlanDocument({
  cotizacion: c,
  ref,
}: {
  cotizacion: CotizacionDinamica;
  ref?: Ref<HTMLDivElement>;
}) {
  const p = c.plan;
  const vencimiento = new Date(c.fecha);
  vencimiento.setUTCDate(vencimiento.getUTCDate() + c.comercial.vigenciaDias);
  const metrics = [
    ["Precio de preventa", p.valorPreventa],
    ["Separación", p.separacion],
    ["Saldo financiado", p.financiado],
    ["Reserva sin intereses a la entrega", p.reservadoEntrega],
    ["Total mensualidades", p.totalCuotas],
    ["Abonos adicionales aplicados", p.totalAbonos],
    ["Intereses totales", p.interesesTotales],
    ["Total antes del pago final (incluye separación)", p.totalAntesEntrega],
    ["Saldo financiado a la entrega", p.saldoFinanciadoFinal],
    ["Pago final adicional", p.pagoFinal],
    ["Total proyectado a pagar", p.totalPagar],
  ] as const;
  return (
    <div
      ref={ref}
      className="dynamic-print-document bg-white p-6 text-[#0e2a47]"
      style={{ colorScheme: "light" }}
    >
      <style>{`
        .dynamic-print-document { font-family: Arial, sans-serif; }
        .dynamic-print-document table { width:100%; border-collapse:collapse; font-variant-numeric:tabular-nums; }
        .dynamic-print-document th,.dynamic-print-document td { padding:5px 4px; border-bottom:1px solid #d5dce1; text-align:right; }
        .dynamic-print-document th:first-child,.dynamic-print-document td:first-child { text-align:left; }
        .dynamic-print-document thead { display:table-header-group; }
        @media print {
          .terra-print-page > .dynamic-print-document > * { break-inside:auto; page-break-inside:auto; }
          .dynamic-print-document tr,.dynamic-print-document .print-summary { break-inside:avoid; page-break-inside:avoid; }
          .dynamic-print-document h2 { break-after:avoid; }
        }
      `}</style>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-[#f7941d] pb-4">
        <img src={logo} alt="TERRA FORMING" className="h-12 w-auto" />
        <div className="text-right">
          <h1 className="text-xl font-bold">Cotizador dinámico</h1>
          <p className="text-xs">{c.codigo}</p>
          <p className="text-xs">{fechaCorta(c.fecha)}</p>
        </div>
      </header>
      <section className="print-summary my-4 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <p className="font-bold">{c.cliente.nombre}</p>
          <p>
            {c.cliente.cc && `CC ${c.cliente.cc}`} {c.cliente.email}
          </p>
          <p>Asesor: {c.vendedor.nombre}</p>
          {c.cliente.referido && <p>Referenciado por: {c.cliente.referido}</p>}
        </div>
        <div>
          <p className="font-bold">
            Lote {c.lote.idLote} · {fmtNum(c.lote.area)} m²
          </p>
          <p>
            Financiación: {c.condiciones.porcentaje}% · {c.condiciones.periodos} mensualidades
          </p>
          <p>
            Tasa: {fmtNum(p.tasaMensual * 100)}% mes vencido · cuota elegida:{" "}
            {fmtCOP(c.condiciones.cuotaMensual)}
          </p>
        </div>
      </section>
      <table className="print-summary text-xs">
        <caption className="mb-2 text-left text-sm font-bold">Resumen de la cotización</caption>
        <tbody>
          {metrics.map(([label, value]) => (
            <tr
              key={label}
              className={
                label === "Pago final adicional" || label === "Total proyectado a pagar"
                  ? "bg-[#edf4e9] font-bold"
                  : ""
              }
            >
              <th scope="row">{label}</th>
              <td>{fmtCOP(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mb-2 mt-5 text-sm font-bold">Plan de pagos proyectado</h2>
      <table className="text-[9px]">
        <thead>
          <tr>
            {[
              "Período / fecha",
              "Saldo inicial",
              "Interés",
              "Cuota / separación",
              "Abonos",
              "Saldo financiado",
            ].map((x) => (
              <th key={x} scope="col">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              0 · {fechaCorta(c.condiciones.fechaSeparacion)}
              <br />
              Separación
            </th>
            <td>—</td>
            <td>—</td>
            <td>{fmtCOP(p.separacion)}</td>
            <td>—</td>
            <td>{fmtCOP(p.financiado)}</td>
          </tr>
          {p.filas.map((f) => (
            <tr key={f.periodo}>
              <th scope="row">
                {f.periodo} · {fechaCorta(f.fecha)}
                {f.tipo === "espera" && (
                  <>
                    <br />
                    Espera de entrega
                  </>
                )}
              </th>
              <td>{fmtCOP(f.saldoInicial)}</td>
              <td>{fmtCOP(f.interes)}</td>
              <td>{fmtCOP(f.cuota)}</td>
              <td>{fmtCOP(f.abonos)}</td>
              <td>{fmtCOP(f.saldoFinal)}</td>
            </tr>
          ))}
          <tr className="bg-[#edf4e9] font-bold">
            <th scope="row">Entrega · {fechaCorta(c.condiciones.fechaEntrega)}</th>
            <td colSpan={3}>Pago final adicional: {fmtCOP(p.pagoFinal)}</td>
            <td>Saldo total</td>
            <td>$0</td>
          </tr>
        </tbody>
      </table>
      {c.condiciones.abonos.length > 0 && (
        <section className="mt-4 text-[10px]">
          <h2 className="font-bold">Abonos programados</h2>
          <ul className="list-disc pl-4">
            {c.condiciones.abonos.map((a) => (
              <li key={a.id}>
                Mes {a.periodo}: {a.concepto || "Abono adicional"} · {fmtCOP(a.valor)} solicitado.
              </li>
            ))}
          </ul>
          <p>
            La tabla muestra los valores efectivamente aplicados. Los abonos se limitan al saldo
            financiado después de la mensualidad.
          </p>
        </section>
      )}
      <section className="mt-4 space-y-1 text-[10px] leading-relaxed">
        <h2 className="font-bold">Condiciones del plan</h2>
        <p>
          Pagos al cierre de cada período mensual contado desde la separación; si la separación es
          al fin de mes, se conserva fin de mes. Primera mensualidad: {fechaCorta(p.filas[0].fecha)}
          .
        </p>
        <p>
          Los pagos cubren primero intereses; lo no cubierto se capitaliza mensualmente. Los abonos
          reducen el saldo y los intereses futuros. El 30% reservado, si aplica, no genera intereses
          y se paga a la entrega.
        </p>
        <p>
          {c.condiciones.interesesHastaEntrega
            ? "El saldo sigue causando intereses hasta la entrega: meses completos a la tasa mensual y fracción de mes a tasa efectiva proporcional a los días del período."
            : "Los intereses cesan después de la última mensualidad; el saldo se conserva hasta la entrega."}
        </p>
        <p>
          El pago final es adicional a las mensualidades y abonos. La cuota se ajusta al cancelar el
          saldo financiado; no se cobran mensualidades posteriores. La reserva del 30%, si existe,
          permanece hasta la entrega.
        </p>
        <p>
          Cuota para cancelar solo la parte financiada en {c.condiciones.periodos} meses, sin
          abonos: {fmtCOP(p.cuotaSinPagoFinal)}.{" "}
          {p.reservadoEntrega > 0 && "Esta cuota no incluye el 30% reservado a la entrega."}
        </p>
        <p>
          Cálculos sin redondeo intermedio; presentación al peso. No incluye otros gastos. Vigencia:{" "}
          {c.comercial.vigenciaDias} días calendario, hasta {fechaCorta(vencimiento.toISOString())},
          sujeta a disponibilidad.
        </p>
        <p>{c.comercial.msgNoReserva}</p>
      </section>
      <footer className="mt-4 border-t pt-3 text-[10px]">
        <p>
          {c.comercial.empresaNombre} · NIT {c.comercial.nit} · {c.comercial.banco} ·{" "}
          {c.comercial.cuenta}
        </p>
        <p>
          {c.comercial.emailMercadeo} · {c.comercial.telefono} · {c.comercial.direccion}
        </p>
      </footer>
    </div>
  );
}
