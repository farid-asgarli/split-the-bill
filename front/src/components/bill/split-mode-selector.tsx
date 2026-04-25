"use client";

import type { SplitMode } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { BottomSheet } from "@/components/ui";

const SPLIT_OPTIONS: {
  mode: SplitMode;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    mode: "equal",
    title: "Split equally",
    description: "Divide evenly between everyone",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    mode: "by_item",
    title: "Split by item",
    description: "Each person picks what they had",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    mode: "custom",
    title: "Custom amounts",
    description: "Enter how much each person pays",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
];

interface SplitModeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function SplitModeSelector({ open, onClose }: SplitModeSelectorProps) {
  const { setSplitMode } = useCheckout();

  function handleSelect(mode: SplitMode) {
    setSplitMode(mode);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Split the bill">
      <div className="space-y-3" role="list" aria-label="Split options">
        {SPLIT_OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            role="listitem"
            onClick={() => handleSelect(option.mode)}
            className="
              flex w-full items-center gap-4
              rounded-rounded border border-border bg-surface
              px-4 py-4
              text-left
              transition-colors duration-150
              hover:border-primary-300 hover:bg-primary-50/50
              active:bg-primary-100
              dark:hover:border-primary-700 dark:hover:bg-surface-elevated
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-primary-500/20 focus-visible:ring-offset-2
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-rounded bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
              {option.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-foreground">
                {option.title}
              </p>
              <p className="text-sm text-muted">{option.description}</p>
            </div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-muted"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
