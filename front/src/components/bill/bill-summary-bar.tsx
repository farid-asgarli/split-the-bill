"use client";

import type { Bill } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { useI18n } from "@/hooks/use-i18n";
import {
  CurrencyDisplay,
  Divider,
  Button,
  AnimatedCurrency,
} from "@/components/ui";

interface BillSummaryBarProps {
  bill: Bill;
  onSplitOpen?: () => void;
}

export function BillSummaryBar({ bill, onSplitOpen }: BillSummaryBarProps) {
  const { step, tip, split, grandTotal, payableAmount, setStep, clearSplit } =
    useCheckout();
  const { t } = useI18n();

  if (step === "confirmation") return null;

  const isSplitting = split.mode !== "none";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-elevated shadow-elevated pb-safe">
      <div className="mx-auto max-w-lg space-y-3 px-4 pb-5 pt-4">
        {/* Line-item breakdown (bill + tip steps) */}
        {(step === "bill" || step === "tip" || step === "split") && (
          <>
            {/* Show full breakdown only when NOT in an active split sub-flow */}
            {!isSplitting && (
              <>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{t("subtotal")}</span>
                  <CurrencyDisplay
                    amount={bill.subtotal}
                    currency={bill.currency}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{bill.tax.label}</span>
                  <CurrencyDisplay
                    amount={bill.tax.amount}
                    currency={bill.currency}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{bill.serviceCharge.label}</span>
                  <CurrencyDisplay
                    amount={bill.serviceCharge.amount}
                    currency={bill.currency}
                    size="sm"
                  />
                </div>
              </>
            )}

            {/* Split share line */}
            {isSplitting && step === "split" && (
              <div className="flex items-center justify-between text-sm text-muted">
                <span>
                  {t("yourShare")}
                  {split.mode === "equal" && (
                    <span>1 {t("of")} {split.headCount}</span>
                  )}
                </span>
                <CurrencyDisplay
                  amount={payableAmount}
                  currency={bill.currency}
                  size="sm"
                  className="font-medium text-foreground"
                />
              </div>
            )}

            {/* Tip line (visible when tip step or when a tip is set) */}
            {step === "tip" && (
              <>
                {isSplitting && (
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>{t("yourShare")}</span>
                    <CurrencyDisplay
                      amount={payableAmount}
                      currency={bill.currency}
                      size="sm"
                    />
                  </div>
                )}
                <div className="animate-fade-in-up flex items-center justify-between text-sm text-muted">
                  <span>
                    {t("tip")}
                    {tip.percentage !== null && (
                      <span className="ml-1 text-xs">({tip.percentage}%)</span>
                    )}
                  </span>
                  <CurrencyDisplay
                    amount={tip.amount}
                    currency={bill.currency}
                    size="sm"
                    className={tip.amount > 0 ? "text-currency" : ""}
                  />
                </div>
              </>
            )}
            <Divider className="!my-2" />
          </>
        )}

        {/* Total */}
        {step === "payment" ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{t("total")}</span>
            <AnimatedCurrency
              amount={grandTotal}
              currency={bill.currency}
              size="lg"
              className="text-currency"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              {isSplitting && step !== "bill" ? t("youPay") : t("total")}
            </span>
            <AnimatedCurrency
              amount={
                step === "tip"
                  ? grandTotal
                  : isSplitting
                    ? payableAmount
                    : bill.total
              }
              currency={bill.currency}
              size="lg"
              className="text-currency"
            />
          </div>
        )}

        {/* CTA buttons */}
        {step === "bill" && (
          <div className="mt-2 flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => {
                setStep("split");
                onSplitOpen?.();
              }}
            >
              {t("splitTheBill")}
            </Button>
            <Button size="lg" className="flex-1" onClick={() => setStep("tip")}>
              {t("payFullBill")}
            </Button>
          </div>
        )}

        {step === "split" && split.mode === "none" && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={() => {
              clearSplit();
              setStep("bill");
            }}
          >
            {t("backToBill")}
          </Button>
        )}

        {step === "tip" && (
          <Button
            size="lg"
            className="mt-2 w-full"
            onClick={() => setStep("payment")}
          >
            {t("pay")}{" "}
            <CurrencyDisplay
              amount={grandTotal}
              currency={bill.currency}
              size="sm"
              className="text-white"
            />
          </Button>
        )}

        {step === "payment" && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full"
            onClick={() => setStep("tip")}
          >
            {t("backToTip")}
          </Button>
        )}
      </div>
    </div>
  );
}
