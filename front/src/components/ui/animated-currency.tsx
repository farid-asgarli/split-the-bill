"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, announceCurrency } from "@/lib/format";

interface AnimatedCurrencyProps {
  amount: number;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Duration of the counting animation in ms */
  duration?: number;
}

const sizeStyles: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-bold",
  xl: "text-4xl font-bold tracking-tight",
};

/**
 * Currency display that animates (counts up/down) when the amount changes.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Falls back to instant display when prefers-reduced-motion is set.
 */
export type { AnimatedCurrencyProps };

export function AnimatedCurrency({
  amount,
  currency = "AZN",
  locale = "az-AZ",
  size = "md",
  className = "",
  duration = 400,
}: AnimatedCurrencyProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);
  const animRef = useRef<number | null>(null);
  const prevAmount = useRef(amount);

  useEffect(() => {
    const from = prevAmount.current;
    const to = amount;
    prevAmount.current = amount;

    if (from === to) return;

    // Check reduced motion preference
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayAmount(to);
      return;
    }

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayAmount(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayAmount(to);
      }
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [amount, duration]);

  const display = formatCurrency(displayAmount, currency, locale);
  const announcement = announceCurrency(amount, currency);

  return (
    <span
      className={`tabular-nums ${sizeStyles[size]} ${className}`}
      aria-label={announcement}
      suppressHydrationWarning
    >
      {display}
    </span>
  );
}
