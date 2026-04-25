"use client";

import { useState, useCallback } from "react";
import type { Bill, Restaurant } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { useI18n } from "@/hooks/use-i18n";
import { Button, Card, CurrencyDisplay, Divider, Input } from "@/components/ui";
import { NpsSurvey } from "./nps-survey";
import { SocialShare } from "./social-share";
import { LoyaltyCard } from "./loyalty-card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5062";

interface PaymentConfirmationProps {
  bill: Bill;
  restaurant: Restaurant;
}

export function PaymentConfirmation({
  bill,
  restaurant,
}: PaymentConfirmationProps) {
  const { tip, grandTotal, payment, reset } = useCheckout();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const paymentMethodLabel =
    payment.method === "apple_pay"
      ? "Apple Pay"
      : payment.method === "google_pay"
        ? "Google Pay"
        : "Card";

  function handleSendReceipt() {
    if (!email) {
      setEmailError(t("pleaseEnterEmail"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t("pleaseEnterValidEmail"));
      return;
    }
    setEmailError("");
    setEmailSent(true);
  }

  const handleNpsSubmit = useCallback(
    async (rating: number, comment?: string) => {
      try {
        await fetch(`${API_BASE}/api/engagement/nps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: "00000000-0000-0000-0000-000000000000", // placeholder until real payment ID is available
            rating,
            comment,
          }),
        });
      } catch {
        // silently fail - NPS is non-critical
      }
    },
    []
  );

  const googleReviewUrl = restaurant.googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${restaurant.googlePlaceId}`
    : null;

  return (
    <section
      className="animate-fade-in-up px-4 pt-6 pb-8"
      aria-label="Payment confirmed"
      aria-live="assertive"
    >
      {/* Success header */}
      <Card className="p-8 text-center">
        {/* Animated checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="3"
              className="animate-circle-draw"
            />
            <path
              d="M14 24 l7 7 13-13"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check-draw"
            />
          </svg>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-foreground">
          {t("paymentSuccessful")}
        </h2>
        <p className="text-sm text-muted">{t("paidVia")} {paymentMethodLabel}</p>
      </Card>

      {/* Payment summary */}
      <Card className="mt-3 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {t("paymentSummary")}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              {t("subtotal")} ({bill.items.length}{" "}
              {bill.items.length === 1 ? t("item") : t("items")})
            </span>
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

          {tip.amount > 0 && (
            <div className="flex items-center justify-between text-sm text-muted">
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
                className="text-currency"
              />
            </div>
          )}

          <Divider className="my-2!" />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              {t("totalPaid")}
            </span>
            <CurrencyDisplay
              amount={grandTotal}
              currency={bill.currency}
              size="lg"
              className="text-currency"
            />
          </div>
        </div>
      </Card>

      {/* Email receipt */}
      <Card className="mt-3 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {t("emailReceipt")}
        </h3>

        {emailSent ? (
          <p className="text-sm text-success" role="status">
            {t("receiptSentTo")} {email}
          </p>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                error={emailError}
                aria-label="Email for receipt"
                className="h-10!"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendReceipt}
              className="mt-0 h-10 shrink-0"
            >
              {t("send")}
            </Button>
          </div>
        )}
      </Card>

      {/* NPS Survey */}
      <NpsSurvey
        restaurantName={restaurant.name}
        onSubmit={handleNpsSubmit}
      />

      {/* Google Review link */}
      {googleReviewUrl && (
        <Card className="mt-3 p-4 text-center">
          <p className="mb-2 text-sm text-muted">
            {t("enjoyedExperience")} {restaurant.name}?
          </p>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
          >
            {t("leaveGoogleReview")}
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12 L12 4 M12 4 L5 4 M12 4 L12 11" />
            </svg>
          </a>
        </Card>
      )}

      {/* Social sharing */}
      <SocialShare
        amount={grandTotal}
        currency={bill.currency}
        restaurantName={restaurant.name}
      />

      {/* Loyalty program */}
      <LoyaltyCard
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />

      {/* Done button */}
      <Button
        variant="secondary"
        size="lg"
        className="mt-4 w-full"
        onClick={reset}
      >
        {t("done")}
      </Button>
    </section>
  );
}
