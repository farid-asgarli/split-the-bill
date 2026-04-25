"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Restaurant, Table, Bill } from "@/types/bill";
import { CheckoutProvider, useCheckout } from "@/hooks/use-checkout";
import { useI18n } from "@/hooks/use-i18n";
import { RestaurantHeader } from "@/components/bill/restaurant-header";
import { BillItemList } from "@/components/bill/bill-item-list";
import { BillSummaryBar } from "@/components/bill/bill-summary-bar";
import { TipSelector } from "@/components/bill/tip-selector";
import { PaymentScreen } from "@/components/bill/payment-screen";
import { PaymentConfirmation } from "@/components/bill/payment-confirmation";
import { SplitModeSelector } from "@/components/bill/split-mode-selector";
import { EqualSplit } from "@/components/bill/equal-split";
import { ItemSplit } from "@/components/bill/item-split";
import { CustomSplit } from "@/components/bill/custom-split";
import { PaymentStatusBar } from "@/components/bill/payment-status-bar";
import { StepTransition, Card, Button } from "@/components/ui";

interface TableBillClientProps {
  restaurant: Restaurant;
  table: Table;
  bill: Bill;
}

/** Trigger haptic feedback via the Vibration API (mobile devices) */
function triggerHaptic(pattern: number | number[] = 50) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function TableBillClientInner({
  restaurant,
  table,
  bill,
}: TableBillClientProps) {
  const { step, split } = useCheckout();
  const { t } = useI18n();
  const [splitSheetOpen, setSplitSheetOpen] = useState(false);
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const prevStep = useRef(step);

  // Session timeout: warn after 30 minutes of inactivity
  useEffect(() => {
    if (step === "confirmation") return; // Don't timeout on confirmation

    let timer: ReturnType<typeof setTimeout>;
    const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => setSessionTimedOut(true), TIMEOUT_MS);
    }

    resetTimer();
    const events = ["touchstart", "click", "scroll", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [step]);

  // Already-paid detection
  if (bill.status === "paid") {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16">
        <Card elevated className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg
              width="28"
              height="28"
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
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            {t("billAlreadySettled")}
          </h2>
          <p className="text-sm text-muted">
            {t("billAlreadyPaid")}
          </p>
        </Card>
      </div>
    );
  }

  // Session timeout overlay
  if (sessionTimedOut) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16">
        <Card elevated className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-warning)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            {t("sessionTimedOut")}
          </h2>
          <p className="mb-5 text-sm text-muted">
            {t("sessionInactive")}
          </p>
          <Button
            size="lg"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            {t("refreshBill")}
          </Button>
        </Card>
      </div>
    );
  }

  // Haptic feedback when reaching payment confirmation
  useEffect(() => {
    if (step === "confirmation" && prevStep.current !== "confirmation") {
      triggerHaptic(50);
    }
    prevStep.current = step;
  }, [step]);

  // Subtle parallax: translate header up slightly on scroll
  const headerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    if (!headerRef.current) return;
    const scrollY = window.scrollY;
    const translateY = Math.min(scrollY * 0.3, 40);
    const opacity = Math.max(1 - scrollY / 200, 0.6);
    headerRef.current.style.transform = `translateY(-${translateY}px)`;
    headerRef.current.style.opacity = String(opacity);
  }, []);

  useEffect(() => {
    // Only apply parallax on bill view step
    if (step !== "bill") {
      if (headerRef.current) {
        headerRef.current.style.transform = "";
        headerRef.current.style.opacity = "";
      }
      return;
    }

    // Check reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [step, handleScroll]);

  // Derive a composite step key for transitions
  const stepKey = step === "split" ? `split-${split.mode}` : step;

  return (
    <div className="mx-auto max-w-lg pb-72">
      <div ref={headerRef} className="parallax-header">
        <RestaurantHeader restaurant={restaurant} tableNumber={table.number} />
      </div>

      {/* Multi-payer status bar */}
      <PaymentStatusBar bill={bill} />

      <StepTransition stepKey={stepKey}>
        {/* Bill items — visible on bill and split steps */}
        {(step === "bill" || (step === "split" && split.mode === "none")) && (
          <BillItemList
            items={bill.items}
            currency={bill.currency}
            paidItemIds={bill.paidItemIds}
            lockedItemIds={bill.lockedItemIds}
          />
        )}

        {/* Split sub-flows */}
        {step === "split" && split.mode === "equal" && (
          <EqualSplit bill={bill} />
        )}
        {step === "split" && split.mode === "by_item" && (
          <ItemSplit bill={bill} />
        )}
        {step === "split" && split.mode === "custom" && (
          <CustomSplit bill={bill} />
        )}

        {step === "tip" && <TipSelector bill={bill} />}
        {step === "payment" && <PaymentScreen bill={bill} />}
        {step === "confirmation" && (
          <PaymentConfirmation bill={bill} restaurant={restaurant} />
        )}
      </StepTransition>

      {/* Split mode selection bottom sheet */}
      <SplitModeSelector
        open={splitSheetOpen}
        onClose={() => setSplitSheetOpen(false)}
      />

      <BillSummaryBar bill={bill} onSplitOpen={() => setSplitSheetOpen(true)} />
    </div>
  );
}

export function TableBillClient({
  restaurant,
  table,
  bill,
}: TableBillClientProps) {
  return (
    <CheckoutProvider bill={bill}>
      <TableBillClientInner restaurant={restaurant} table={table} bill={bill} />
    </CheckoutProvider>
  );
}
