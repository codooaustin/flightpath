import Link from "next/link";
import { cn } from "@/lib/utils";

interface FlightPathLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function FlightPathLogo({
  className,
  size = "md",
  href = "/dashboard",
}: FlightPathLogoProps) {
  const runwayClass =
    size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";
  const nameClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-bold leading-none tracking-wider text-sky-600",
          runwayClass
        )}
      >
        09L
      </span>
      <span className={cn("font-bold leading-none", nameClass)}>
        Flight Path
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

export function StageNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums leading-none font-bold", className)}>
      {String(value).padStart(2, "0")}
    </span>
  );
}
