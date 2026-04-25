"use client";

import type { Bill } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { CurrencyDisplay, Button } from "@/components/ui";
import { calculateEqualShare } from "@/lib/split";

interface EqualSplitProps {
  bill: Bill;
}

const QUICK_COUNTS = [2, 3, 4, 5, 6];

export function EqualSplit({ bill }: EqualSplitProps) {
  const { split, setEqualHeadCount, setStep, clearSplit } = useCheckout();

  if (split.mode !== "equal") return null;

  const { headCount } = split;
  const { perPerson, lastPerson } = calculateEqualShare(
    bill.total,
    headCount
  );
  const hasRounding = perPerson !== lastPerson;

  function handleDecrement() {
    if (headCount > 2) setEqualHeadCount(headCount - 1);
  }

  function handleIncrement() {
    setEqualHeadCount(headCount + 1);
  }

  return (
    <section
      className="animate-fade-in-up px-4 pt-6"
      aria-label="Equal split"
    >
      {/* Back link */}
      <button
        type="button"
        onClick={() => clearSplit()}
        className="mb-4 flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
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
        Split equally
      </h2>
      <p className="mb-6 text-sm text-muted">
        How many people are splitting?
      </p>

      {/* Quick-select chips */}
      <div
        className="mb-6 flex items-center gap-2"
        role="radiogroup"
        aria-label="Number of people"
      >
        {QUICK_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={headCount === n}
            aria-label={`${n} people`}
            onClick={() => setEqualHeadCount(n)}
            className={`
              flex h-11 w-11 items-center justify-center
              rounded-full text-sm font-semibold
              transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-primary-500/20 focus-visible:ring-offset-2
              ${
                headCount === n
                  ? "bg-primary-600 text-white shadow-sm"
                  : "border border-border bg-surface text-foreground hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-surface-elevated"
              }
            `}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Stepper for fine control */}
      <div className="mb-8 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={headCount <= 2}
          aria-label="Decrease people"
          className="
            flex h-12 w-12 items-center justify-center
            rounded-full border border-border bg-surface
            text-lg font-medium text-foreground
            transition-all duration-150
            hover:border-primary-300 hover:bg-primary-50/50
            active:scale-95
            disabled:opacity-40 disabled:pointer-events-none
            dark:hover:bg-surface-elevated
          "
        >
          &minus;
        </button>

        <div className="flex flex-col items-center">
          <span
            className="text-4xl font-bold tabular-nums text-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {headCount}
          </span>
          <span className="text-sm text-muted">people</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          aria-label="Increase people"
          className="
            flex h-12 w-12 items-center justify-center
            rounded-full border border-border bg-surface
            text-lg font-medium text-foreground
            transition-all duration-150
            hover:border-primary-300 hover:bg-primary-50/50
            active:scale-95
            dark:hover:bg-surface-elevated
          "
        >
          +
        </button>
      </div>

      {/* Per-person amount */}
      <div className="mb-4 rounded-rounded border border-border bg-surface p-5 text-center">
        <p className="mb-1 text-sm text-muted">Your share</p>
        <CurrencyDisplay
          amount={perPerson}
          currency={bill.currency}
          size="xl"
          className="text-primary-600"
        />
        <p className="mt-1 text-sm text-muted">
          1 of {headCount}
        </p>

        {hasRounding && (
          <p className="mt-3 text-xs text-muted">
            Last person pays{" "}
            <CurrencyDisplay
              amount={lastPerson}
              currency={bill.currency}
              size="sm"
              className="font-medium text-foreground"
            />{" "}
            to cover rounding
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full"
        onClick={() => setStep("tip")}
      >
        Pay your share
      </Button>
    </section>
  );
}
