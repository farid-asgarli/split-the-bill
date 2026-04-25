"use client";

import { useState } from "react";
import type { Bill, Restaurant } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { Button, Card, CurrencyDisplay, Divider, Input } from "@/components/ui";

interface PaymentConfirmationProps {
  bill: Bill;
  restaurant: Restaurant;
}

export function PaymentConfirmation({
  bill,
  restaurant,
}: PaymentConfirmationProps) {
  const { tip, grandTotal, payment, reset } = useCheckout();
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
      setEmailError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    setEmailSent(true);
  }

  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${restaurant.id}`;

  return (
    <section
      className="animate-fade-in-up px-4 pt-6"
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
          Payment successful
        </h2>
        <p className="text-sm text-muted">
          Paid via {paymentMethodLabel}
        </p>
      </Card>

      {/* Payment summary */}
      <Card className="mt-3 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Payment summary
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>
              Subtotal ({bill.items.length}{" "}
              {bill.items.length === 1 ? "item" : "items"})
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
                Tip
                {tip.percentage !== null && (
                  <span className="ml-1 text-xs">({tip.percentage}%)</span>
                )}
              </span>
              <CurrencyDisplay
                amount={tip.amount}
                currency={bill.currency}
                size="sm"
                className="text-primary-600"
              />
            </div>
          )}

          <Divider className="my-2!" />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">
              Total paid
            </span>
            <CurrencyDisplay
              amount={grandTotal}
              currency={bill.currency}
              size="lg"
              className="text-primary-600"
            />
          </div>
        </div>
      </Card>

      {/* Email receipt */}
      <Card className="mt-3 p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Email receipt
        </h3>

        {emailSent ? (
          <p className="text-sm text-success" role="status">
            Receipt sent to {email}
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
              Send
            </Button>
          </div>
        )}
      </Card>

      {/* Leave a review */}
      <Card className="mt-3 p-4 text-center">
        <p className="mb-2 text-sm text-muted">
          Enjoyed your experience at {restaurant.name}?
        </p>
        <a
          href={googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Leave a review
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

      {/* Done button */}
      <Button
        variant="secondary"
        size="lg"
        className="mt-4 w-full"
        onClick={reset}
      >
        Done
      </Button>
    </section>
  );
}
