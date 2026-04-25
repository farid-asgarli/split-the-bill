"use client";

import { useEffect } from "react";
import { Card, Button } from "@/components/ui";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <Card className="max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-error dark:bg-red-950">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-muted">
          We had trouble loading your bill. Please check your connection and try
          again.
        </p>
        <Button onClick={() => unstable_retry()} variant="primary">
          Try again
        </Button>
      </Card>
    </div>
  );
}
