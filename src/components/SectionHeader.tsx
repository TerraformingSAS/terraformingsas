import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto" : ""} max-w-3xl`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-brand-green">
          <span className="h-px w-8 bg-brand-green" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy leading-tight">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-base sm:text-lg text-brand-dark/80 leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}