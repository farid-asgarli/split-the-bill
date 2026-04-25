"use client";

import { useState, useRef, useEffect } from "react";
import type { Bill, TipOption } from "@/types/bill";
import { TIP_PRESETS, calculateTipAmount } from "@/lib/tip";
import { useCheckout } from "@/hooks/use-checkout";
import { useI18n } from "@/hooks/use-i18n";
import { CurrencyDisplay, BottomSheet, Button, Input } from "@/components/ui";

interface TipSelectorProps {
  bill: Bill;
}

export function TipSelector({ bill }: TipSelectorProps) {
  const { tip, selectTip, setCustomTip } = useCheckout();
  const { t } = useI18n();
  const [customSheetOpen, setCustomSheetOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customSheetOpen) {
      // Small delay to allow sheet animation before focusing
      const timer = setTimeout(() => customInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [customSheetOpen]);

  function handlePresetSelect(option: TipOption) {
    selectTip(option);
  }

  function handleCustomOpen() {
    setCustomValue(
      tip.option === "custom" && tip.amount > 0 ? String(tip.amount) : ""
    );
    setCustomSheetOpen(true);
  }

  function handleCustomDone() {
    const parsed = parseInt(customValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setCustomTip(parsed);
    }
    setCustomSheetOpen(false);
  }

  return (
    <section
      className="animate-fade-in-up px-4 pt-6"
      aria-label="Tip selection"
    >
      <h2 className="mb-1 text-lg font-semibold text-foreground">
        {t("addATip")}
      </h2>
      <p className="mb-4 text-sm text-muted">{t("tipCalculatedOnSubtotal")}</p>

      {/* Preset options */}
      <div
        role="radiogroup"
        aria-label="Tip percentage"
        className="grid grid-cols-3 gap-3"
      >
        {TIP_PRESETS.map((preset) => {
          const isSelected = tip.option === preset.option;
          const amount = calculateTipAmount(bill.subtotal, preset.percentage);

          return (
            <button
              key={preset.option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${preset.percentage} percent tip, ${amount} ${bill.currency}`}
              onClick={() => handlePresetSelect(preset.option)}
              className={`
                flex flex-col items-center justify-center gap-1
                rounded-rounded border-2 px-3 py-4
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2
                ${
                  isSelected
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-950/30"
                    : "border-border bg-surface hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-surface-elevated"
                }
              `}
            >
              <span className="text-lg font-semibold text-foreground">
                {preset.percentage}%
              </span>
              <CurrencyDisplay
                amount={amount}
                currency={bill.currency}
                size="sm"
                className="text-muted"
              />
            </button>
          );
        })}
      </div>

      {/* Custom + No tip row */}
      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handleCustomOpen}
          className={`flex-1 ${tip.option === "custom" ? "border-primary-600" : ""}`}
        >
          {tip.option === "custom" && tip.amount > 0 ? (
            <CurrencyDisplay
              amount={tip.amount}
              currency={bill.currency}
              size="sm"
            />
          ) : (
            "Custom"
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectTip("none")}
          className={`text-muted ${tip.option === "none" ? "text-foreground" : ""}`}
        >
          {t("noTip")}
        </Button>
      </div>

      {/* Custom tip bottom sheet */}
      <BottomSheet
        open={customSheetOpen}
        onClose={() => setCustomSheetOpen(false)}
        title={t("customTip")}
      >
        <div className="space-y-4">
          <Input
            ref={customInputRef}
            label={t("tipAmount")}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="0"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCustomDone();
            }}
          />
          <Button size="lg" className="w-full" onClick={handleCustomDone}>
            {t("done")}
          </Button>
        </div>
      </BottomSheet>
    </section>
  );
}
