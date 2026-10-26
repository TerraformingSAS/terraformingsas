import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";

export function PdfExportButton({
  targetRef,
  fileName,
  onBeforePrint,
  children,
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
  options?: unknown;
  onBeforePrint?: () => Promise<boolean>;
  children?: ReactNode;
}) {
  async function printQuote() {
    if (onBeforePrint) {
      const seguir = await onBeforePrint();
      if (!seguir) return;
    }
    const target = targetRef.current;
    if (!target) return;
    const previousTitle = document.title;
    document.title = fileName.replace(/\.pdf$/i, "");
    const shell = document.createElement("div");
    shell.className = "terra-print-root";
    const page = document.createElement("div");
    page.className = "terra-print-page";
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.width = "190mm";
    clone.style.maxWidth = "190mm";
    page.appendChild(clone);
    shell.appendChild(page);
    document.body.appendChild(shell);
    const px = 96 / 25.4;
    const pageWidth = (215.9 - 12) * px;
    const pageHeight = (279.4 - 12) * px;
    const scale = Math.min(1, pageWidth / clone.scrollWidth, pageHeight / clone.scrollHeight);
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = "top left";
    page.style.width = `${clone.scrollWidth * scale}px`;
    page.style.height = `${clone.scrollHeight * scale}px`;
    page.style.overflow = "hidden";
    const cleanup = () => {
      shell.remove();
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
