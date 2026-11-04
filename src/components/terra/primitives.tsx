import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function TerraKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange",
        className,
      )}
    >
      <span className="h-px w-8 bg-brand-orange" aria-hidden />
      {children}
    </p>
  );
}

export function TerraCaption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-dark/55">
      {children}
    </p>
  );
}

const primaryClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-orange px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-60";

const secondaryClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-current/20 bg-transparent px-5 text-sm font-semibold transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

export function TerraPrimaryLink({ className, ...props }: ComponentProps<"a">) {
  return <a className={cn(primaryClass, className)} {...props} />;
}

export function TerraSecondaryLink({ className, ...props }: ComponentProps<"a">) {
  return <a className={cn(secondaryClass, className)} {...props} />;
}

export function TerraPrimaryButton({ className, ...props }: ComponentProps<"button">) {
  return <button className={cn(primaryClass, "w-full", className)} {...props} />;
}
