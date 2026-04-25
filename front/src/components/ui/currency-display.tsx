import { formatCurrency, announceCurrency } from "@/lib/format";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-bold",
  xl: "text-4xl font-bold tracking-tight",
};

function CurrencyDisplay({
  amount,
  currency = "INR",
  locale = "en-IN",
  size = "md",
  className = "",
}: CurrencyDisplayProps) {
  const display = formatCurrency(amount, currency, locale);
  const announcement = announceCurrency(amount, currency);

  return (
    <span
      className={`tabular-nums ${sizeStyles[size]} ${className}`}
      aria-label={announcement}
    >
      {display}
    </span>
  );
}

export { CurrencyDisplay };
export type { CurrencyDisplayProps };
