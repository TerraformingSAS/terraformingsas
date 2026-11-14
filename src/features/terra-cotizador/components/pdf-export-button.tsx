import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/button";

const LETTER_WIDTH_PX = 816;

function whenReady(target: EventTarget, event: string) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, 2500);
    target.addEventListener(
      event,
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

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

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${LETTER_WIDTH_PX}px;height:1400px;border:0;`;
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!doc || !frameWindow) {
      iframe.remove();
      return;
    }

    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
      .map((node) => node.outerHTML)
      .join("");
    const title = fileName.replace(/\.pdf$/i, "");
    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${LETTER_WIDTH_PX}">
<base href="${document.baseURI}">
${styles}
<style>
  html, body { margin: 0; padding: 0; background: #fff; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { width: 190mm; }
</style>
</head>
<body></body>
</html>`);
    doc.close();
    doc.title = title;

    const shell = doc.createElement("div");
    shell.className = "terra-print-root";
    const page = doc.createElement("div");
    page.className = "terra-print-page";
    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.width = "190mm";
    clone.style.minWidth = "190mm";
    clone.style.maxWidth = "190mm";
    page.appendChild(clone);
    shell.appendChild(page);
    doc.body.appendChild(shell);

    const stylesheets = [...doc.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(
      stylesheets.map((link) =>
        (link as HTMLLinkElement).sheet
          ? Promise.resolve()
          : Promise.race([whenReady(link, "load"), whenReady(link, "error")]),
      ),
    );
    const images = [...clone.querySelectorAll("img")];
    await Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : Promise.race([whenReady(img, "load"), whenReady(img, "error")]),
      ),
    );
    await doc.fonts?.ready;

    const previousTitle = document.title;
    document.title = title;
    let closed = false;
    const cleanup = () => {
      if (closed) return;
      closed = true;
      iframe.remove();
      document.title = previousTitle;
      frameWindow.removeEventListener("afterprint", cleanup);
    };
    frameWindow.addEventListener("afterprint", cleanup);
    window.setTimeout(cleanup, 120000);
    frameWindow.focus();
    frameWindow.print();
  }

  return (
    <Button type="button" onClick={printQuote} data-pdf-exclude>
      {children ?? "Descargar PDF"}
    </Button>
  );
}
