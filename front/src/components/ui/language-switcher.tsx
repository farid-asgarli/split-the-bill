"use client";

import { useI18n } from "@/hooks/use-i18n";
import type { Locale } from "@/i18n";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "az", label: "AZ" },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className="inline-flex rounded-full border border-border bg-surface p-0.5 text-xs"
      role="radiogroup"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={locale === l.code}
          onClick={() => setLocale(l.code)}
          className={`
            rounded-full px-2.5 py-1 font-medium transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
            ${
              locale === l.code
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }
          `}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
