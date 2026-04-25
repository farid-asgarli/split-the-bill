"use client";

import type { Bill } from "@/types/bill";
import { CurrencyDisplay } from "@/components/ui";

interface PaymentStatusBarProps {
  bill: Bill;
}

export function PaymentStatusBar({ bill }: PaymentStatusBarProps) {
  if (bill.status === "open" && bill.amountPaid === 0) return null;
  if (bill.status === "paid") return null;

  const paidPercent =
    bill.total > 0
      ? Math.min(100, Math.round((bill.amountPaid / bill.total) * 100))
      : 0;

  return (
    <div
      className="mx-4 mb-3 overflow-hidden rounded-rounded border border-border bg-surface p-3"
      role="status"
      aria-label={`${bill.amountPaid} paid, ${bill.amountRemaining} remaining`}
    >
      {/* Progress bar */}
      <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-primary-100 dark:bg-primary-950/30">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${paidPercent}%` }}
          role="progressbar"
          aria-valuenow={paidPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Amounts */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <CurrencyDisplay
            amount={bill.amountPaid}
            currency={bill.currency}
            size="sm"
            className="font-medium text-success"
          />
          <span>paid</span>
        </span>

        <span className="flex items-center gap-1.5 text-muted">
          <CurrencyDisplay
            amount={bill.amountRemaining}
            currency={bill.currency}
            size="sm"
            className="font-medium text-foreground"
          />
          <span>remaining</span>
        </span>
      </div>
    </div>
  );
}
