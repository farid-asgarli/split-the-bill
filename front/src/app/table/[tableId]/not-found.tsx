import { Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <Card className="max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Table not found
        </h1>
        <p className="mb-6 text-sm text-muted">
          We couldn&apos;t find a bill for this table. The QR code may be
          invalid or the session may have expired.
        </p>
        <p className="text-sm text-muted">
          Try scanning the QR code on your table again.
        </p>
      </Card>
    </div>
  );
}
