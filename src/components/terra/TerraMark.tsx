export function TerraMark({
  className = "",
  light = true,
}: {
  className?: string;
  light?: boolean;
}) {
  const color = light ? "text-white" : "text-brand-navy";
  return (
    <div className={`flex flex-col ${className}`}>
      <svg
        width="36"
        height="18"
        viewBox="0 0 36 18"
        fill="none"
        className={`mb-1 ${color}`}
        aria-hidden
      >
        <path
          d="M18 16C14 10 10 7 8 4c2 0 5 1 7 4 1-4 4-7 8-8-1 4-2 8-5 16z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M18 16C15 9 9 5 4 3c3 1 7 3 9 7 0-3 2-6 5-8-1 4-1 8 0 14z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M18 16c3-6 8-9 14-11-4 2-7 5-8 9 2-2 5-3 8-3-3 4-7 7-14 5z"
          fill="currentColor"
          opacity="0.85"
        />
      </svg>
      <span
        className={`font-display text-2xl sm:text-3xl font-extrabold tracking-[0.18em] leading-none ${color}`}
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
