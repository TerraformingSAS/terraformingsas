import logoLight from "@/assets/terra/logo-terra-light.png";
import logoNavy from "@/assets/terra/logo-terra-navy.png";

export function TerraMark({
  className = "",
  light = true,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <img
      src={light ? logoLight : logoNavy}
      alt="TERRA. Naturaleza que te pertenece."
      width={662}
      height={480}
      className={`h-11 w-auto object-contain sm:h-12 ${className}`}
    />
  );
}
