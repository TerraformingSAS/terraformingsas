import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";

export function PdfExportButton({
  targetRef,
  fileName,
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
    const previousTitle = document.title;
    document.title = fileName.replace(/\.pdf$/i, "");
    target.classList.add("terra-print-target");
    const pageWidth = (190 / 25.4) * 96;
    const pageHeight = ((279.4 - 16) / 25.4) * 96;
    const scale = Math.min(1, pageWidth / target.scrollWidth, pageHeight / target.scrollHeight);
    target.style.setProperty("--terra-print-scale", String(scale));
    const cleanup = () => {
      target.classList.remove("terra-print-target");
      target.style.removeProperty("--terra-print-scale");
      document.title = previousTitle;
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
