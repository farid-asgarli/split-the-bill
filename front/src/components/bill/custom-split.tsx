"use client";

import { useState, useRef, useEffect } from "react";
import type { Bill } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { CurrencyDisplay, Button } from "@/components/ui";
import { clampCustomAmount } from "@/lib/split";
import { formatCurrency } from "@/lib/format";

interface CustomSplitProps {
  bill: Bill;
}

export function CustomSplit({ bill }: CustomSplitProps) {
  const { split, setCustomAmount, setStep, clearSplit } = useCheckout();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  if (split.mode !== "custom") return null;

  const remaining = bill.amountRemaining;
  const myAmount = split.myAmount;
  const balanceAfter = remaining - myAmount;
  const isValid = myAmount > 0 && myAmount <= remaining;

  function handleChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "");
    setInputValue(digits);
    const parsed = parseInt(digits, 10);
    if (!isNaN(parsed)) {
      setCustomAmount(clampCustomAmount(parsed, remaining));
    } else {
      setCustomAmount(0);
    }
  }

  function handlePayRest() {
    setInputValue(String(remaining));
    setCustomAmount(remaining);
  }

  return (
    <section
      className="animate-fade-in-up px-4 pt-6"
      aria-label="Custom amount split"
    >
      {/* Back link */}
      <button
        type="button"
        onClick={() => clearSplit()}
        className="mb-4 flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Change split method
      </button>

      <h2 className="mb-1 text-lg font-semibold text-foreground">
        Custom amount
      </h2>
      <p className="mb-6 text-sm text-muted">Enter how much you want to pay</p>

      {/* Remaining balance */}
      <div className="mb-6 rounded-rounded border border-border bg-surface p-4 text-center">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
          Bill remaining
        </p>
        <CurrencyDisplay
          amount={remaining}
          currency={bill.currency}
          size="lg"
          className="text-foreground"
        />
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label
          htmlFor="custom-amount"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          How much do you want to pay?
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted">
            ₼
          </span>
          <input
            ref={inputRef}
            id="custom-amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            className="
              h-14 w-full rounded-rounded border border-border
              bg-surface pl-10 pr-4
              text-2xl font-semibold tabular-nums text-foreground
              transition-colors duration-150
              placeholder:text-muted/40
              focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20
            "
            aria-describedby="remaining-hint"
          />
        </div>
      </div>

      {/* Pay the rest shortcut */}
      <button
        type="button"
        onClick={handlePayRest}
        className="
          mb-6 w-full rounded-soft border border-dashed border-primary-300
          bg-primary-50/50 px-4 py-2.5
          text-sm font-medium text-primary-700
          transition-colors duration-150
          hover:bg-primary-100/60
          dark:border-primary-700 dark:bg-primary-950/20 dark:text-primary-400
          dark:hover:bg-primary-950/30
        "
      >
        Pay the rest — {formatCurrency(remaining, bill.currency)}
      </button>

      {/* Balance after payment */}
      {myAmount > 0 && (
        <div
          id="remaining-hint"
          className="mb-6 rounded-rounded border border-border bg-surface p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Your amount</span>
            <CurrencyDisplay
              amount={myAmount}
              currency={bill.currency}
              size="sm"
              className="font-medium text-currency"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Remaining after you</span>
            <CurrencyDisplay
              amount={balanceAfter}
              currency={bill.currency}
              size="sm"
              className={`font-medium ${balanceAfter === 0 ? "text-success" : "text-foreground"}`}
            />
          </div>
          {balanceAfter === 0 && (
            <p className="mt-2 text-center text-xs text-success">
              This covers the entire remaining bill
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <Button
        size="lg"
        className="w-full"
        disabled={!isValid}
        onClick={() => setStep("tip")}
      >
        Pay your share
      </Button>
    </section>
  );
}
