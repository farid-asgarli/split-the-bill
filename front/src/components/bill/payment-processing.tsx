"use client";

import { Skeleton } from "@/components/ui";

export function PaymentProcessing() {
  return (
    <section
      className="animate-fade-in-up px-4 pt-6"
      aria-label="Processing payment"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-rounded bg-surface p-8 shadow-card">
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing receipt skeleton */}
          <div className="w-full max-w-[200px] space-y-3">
            <Skeleton className="mx-auto h-3 w-3/4 animate-shimmer" />
            <Skeleton className="mx-auto h-3 w-full animate-shimmer [animation-delay:200ms]" />
            <Skeleton className="mx-auto h-3 w-2/3 animate-shimmer [animation-delay:400ms]" />
            <div className="py-2">
              <Skeleton className="mx-auto h-5 w-1/2 animate-shimmer [animation-delay:600ms]" />
            </div>
          </div>

          <p className="text-sm text-muted">Processing payment&hellip;</p>
        </div>
      </div>
    </section>
  );
}
