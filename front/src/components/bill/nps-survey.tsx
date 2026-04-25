"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";

interface NpsSurveyProps {
  restaurantName: string;
  onSubmit: (rating: number, comment?: string) => void;
}

const ratings = [1, 2, 3, 4, 5] as const;
const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

export function NpsSurvey({ restaurantName, onSubmit }: NpsSurveyProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (rating === null) return;
    setSubmitted(true);
    onSubmit(rating, comment || undefined);
  }

  if (submitted) {
    return (
      <Card className="mt-3 p-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-success"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">
          Thanks for your feedback!
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-3 p-4">
      <h3 className="mb-1 text-sm font-semibold text-foreground">
        How was your experience?
      </h3>
      <p className="mb-3 text-xs text-muted">
        Rate your visit at {restaurantName}
      </p>

      {/* Star rating */}
      <div
        className="mb-3 flex items-center justify-center gap-1"
        role="radiogroup"
        aria-label="Rating"
      >
        {ratings.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="min-h-[44px] min-w-[44px] rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star - ${ratingLabels[star]}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-7 w-7 transition-colors ${
                rating !== null && star <= rating
                  ? "fill-accent-400 text-accent-400"
                  : "fill-none text-muted/40"
              }`}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>

      {rating !== null && (
        <p className="mb-3 text-center text-xs font-medium text-accent-600">
          {ratingLabels[rating]}
        </p>
      )}

      {/* Optional comment */}
      {rating !== null && (
        <div className="mb-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional comments? (optional)"
            className="w-full rounded-lg border border-border bg-surface p-2.5 text-sm text-foreground placeholder:text-muted/60 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={2}
            aria-label="Additional comments"
          />
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={handleSubmit}
        disabled={rating === null}
      >
        Submit feedback
      </Button>
    </Card>
  );
}
