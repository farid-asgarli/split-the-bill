"use client";

import { useState, useRef, useEffect } from "react";
import type { Bill, PaymentMethod } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { useI18n } from "@/hooks/use-i18n";
import {
  Button,
  Card,
  Input,
  CurrencyDisplay,
  AnimatedCurrency,
  Divider,
} from "@/components/ui";
import { PaymentProcessing } from "./payment-processing";

interface PaymentScreenProps {
  bill: Bill;
}

export function PaymentScreen({ bill }: PaymentScreenProps) {
  const { grandTotal, payment, startPayment, resetPayment } = useCheckout();
  const { t } = useI18n();
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const cardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCardForm) {
      const timer = setTimeout(() => cardInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [showCardForm]);

  if (payment.status === "processing") {
    return <PaymentProcessing />;
  }

  if (payment.status === "error") {
    return (
      <section className="animate-fade-in-up px-4 pt-6" aria-label="Payment error">
        <Card elevated className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            {t("paymentFailed")}
          </h2>
          <p className="mb-5 text-sm text-muted">
            {payment.errorMessage || t("somethingWentWrong")}
          </p>
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => startPayment(payment.method!)}
            >
              {t("tryAgain")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={resetPayment}
            >
              {t("useDifferentMethod")}
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }

  function validateCard(): boolean {
    const errors: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 13 || digits.length > 16) {
      errors.cardNumber = t("enterValidCard");
    }
    const expiryDigits = expiry.replace("/", "");
    if (expiryDigits.length !== 4) {
      errors.expiry = "MM/YY";
    }
    if (cvc.length < 3 || cvc.length > 4) {
      errors.cvc = "3-4 digits";
    }
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleCardPay() {
    if (!validateCard()) return;
    startPayment("card");
  }

  function handleWalletPay(method: PaymentMethod) {
    startPayment(method);
  }

  return (
    <section className="animate-fade-in-up px-4 pt-6" aria-label="Payment">
      {/* Grand total */}
      <Card elevated className="mb-6 p-6 text-center">
        <p className="mb-1 text-sm text-muted">{t("totalToPay")}</p>
        <AnimatedCurrency
          amount={grandTotal}
          currency={bill.currency}
          size="xl"
          className="text-currency"
        />
      </Card>

      {/* Digital wallets */}
      <div className="space-y-3">
        {/* Apple Pay */}
        <button
          type="button"
          onClick={() => handleWalletPay("apple_pay")}
          className="
            flex h-14 w-full items-center justify-center gap-2
            rounded-rounded bg-black text-white
            transition-opacity duration-150
            hover:opacity-90 active:opacity-80
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2
          "
          aria-label="Pay with Apple Pay"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="text-base font-medium">{t("pay")}</span>
        </button>

        {/* Google Pay */}
        <button
          type="button"
          onClick={() => handleWalletPay("google_pay")}
          className="
            flex h-14 w-full items-center justify-center gap-2
            rounded-rounded border border-border bg-surface
            transition-colors duration-150
            hover:bg-primary-50/50 active:bg-primary-100/50
            dark:hover:bg-surface-elevated
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2
          "
          aria-label="Pay with Google Pay"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.02 10.02 0 0 0 1.1 12c0 1.61.39 3.14 1.08 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-base font-medium text-foreground">{t("pay")}</span>
        </button>
      </div>

      {/* Card option */}
      <Divider className="my-6" label={t("orPayWithCard")} />

      {!showCardForm ? (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setShowCardForm(true)}
        >
          {t("creditOrDebitCard")}
        </Button>
      ) : (
        <Card className="animate-fade-in-up p-5">
          <h3 className="mb-4 text-base font-semibold text-foreground">
            {t("cardDetails")}
          </h3>
          <div className="space-y-4">
            <Input
              ref={cardInputRef}
              label={t("cardNumber")}
              inputMode="numeric"
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              error={cardErrors.cardNumber}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t("expiry")}
                inputMode="numeric"
                maxLength={5}
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                error={cardErrors.expiry}
              />
              <Input
                label={t("cvc")}
                inputMode="numeric"
                maxLength={4}
                placeholder="123"
                value={cvc}
                onChange={(e) =>
                  setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                error={cardErrors.cvc}
              />
            </div>
            <Button size="lg" className="w-full" onClick={handleCardPay}>
              {t("pay")}{" "}
              <CurrencyDisplay
                amount={grandTotal}
                currency={bill.currency}
                size="sm"
              />
            </Button>
          </div>
        </Card>
      )}
    </section>
  );
}
