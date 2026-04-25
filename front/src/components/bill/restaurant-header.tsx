"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Restaurant } from "@/types/bill";
import { Badge, LanguageSwitcher } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useI18n } from "@/hooks/use-i18n";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  tableNumber: number;
}

export function RestaurantHeader({
  restaurant,
  tableNumber,
}: RestaurantHeaderProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 9999,
    });
  }, [open]);

  return (
    <header className="px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
          <span className="text-lg font-semibold" aria-hidden="true">
            {restaurant.name.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {restaurant.name}
          </h1>
          <p className="truncate text-sm text-muted">{restaurant.address}</p>
        </div>
        <Badge variant="neutral">{t("table")} {tableNumber}</Badge>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Settings"
            aria-expanded={open}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 ${
              open
                ? "bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                : "bg-surface-elevated text-muted hover:text-foreground"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <>
          {/* Scrim — closes on outside click */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          {/* Popover */}
          <div
            style={popoverStyle}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-3 shadow-elevated animate-fade-in-up"
          >
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
