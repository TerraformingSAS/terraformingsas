import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";

export function PdfExportButton({
  targetRef,
  children,
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
  options?: unknown;
  children?: ReactNode;
}) {
  function printQuote() {
    const target = targetRef.current;
    if (!target) return;
    target.classList.add("terra-print-target");
    const cleanup = () => {
      target.classList.remove("terra-print-target");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <Button type="button" onClick={printQuote} data-pdf-exclude>
      {children ?? "Descargar PDF"}
    </Button>
  );
}
