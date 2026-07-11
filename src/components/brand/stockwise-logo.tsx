import { cn } from "@/lib/utils";

type StockWiseLogoProps = {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "mono" | "inverse";
};

export function StockWiseMark({
  className,
  variant = "default",
}: Omit<StockWiseLogoProps, "showWordmark">) {
  const foreground = variant === "default" ? "#FFFFFF" : "currentColor";
  const background = variant === "default" ? "#0F766E" : "none";

  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="StockWise"
      className={cn("size-10 shrink-0", className)}
    >
      <title>StockWise</title>
      <rect
        x="4.5"
        y="4.5"
        width="31"
        height="31"
        rx="7.5"
        fill={background}
        stroke={variant === "default" ? "#0F766E" : foreground}
        strokeWidth="2"
      />
      <path
        d="M10 12.5h20M10 27.5h20"
        fill="none"
        stroke={variant === "default" ? "#67E8F9" : foreground}
        strokeLinecap="round"
        strokeWidth="1.8"
        opacity={variant === "default" ? 0.8 : 0.55}
      />
      <path
        d="m9.5 14.5 5 11 5.5-8 5.5 8 5-11"
        fill="none"
        stroke={foreground}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function StockWiseLogo({
  className,
  showWordmark = true,
  variant = "default",
}: StockWiseLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3",
        variant === "inverse" && "text-white",
        className
      )}
    >
      <StockWiseMark variant={variant} />
      {showWordmark ? (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            variant === "inverse" ? "text-white" : "text-foreground"
          )}
        >
          StockWise
        </span>
      ) : null}
    </span>
  );
}
