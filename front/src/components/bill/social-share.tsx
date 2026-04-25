"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface SocialShareProps {
  amount: number;
  currency: string;
  restaurantName: string;
}

export function SocialShare({
  amount,
  currency,
  restaurantName,
}: SocialShareProps) {
  const [shared, setShared] = useState(false);

  const formattedAmount = new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);

  const shareText = `I just split a ${formattedAmount} bill at ${restaurantName} in seconds! No app needed.`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Split the Bill",
          text: shareText,
        });
        setShared(true);
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  }

  return (
    <Card className="mt-3 p-4 text-center">
      <p className="mb-2 text-xs text-muted">Share your experience</p>
      <p className="mb-3 rounded-lg bg-surface-elevated p-2.5 text-sm text-foreground/80 italic">
        &ldquo;{shareText}&rdquo;
      </p>
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={handleShare}
      >
        {shared ? (
          <span className="flex items-center justify-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-success"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            Copied!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </span>
        )}
      </Button>
    </Card>
  );
}
