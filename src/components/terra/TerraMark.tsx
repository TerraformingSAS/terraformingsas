export function TerraMark({
  className = "",
  light = true,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className={`font-display text-2xl sm:text-3xl font-extrabold tracking-[0.18em] leading-none ${
          light ? "text-white" : "text-brand-navy"
        }`}
      >
        TERRA
      </span>
      <span
        className={`mt-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase ${
          light ? "text-white/75" : "text-brand-navy/70"
        }`}
      >
        Naturaleza que te pertenece
      </span>
    </div>
  );
}
