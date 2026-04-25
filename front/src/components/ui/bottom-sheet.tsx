"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="
          relative z-10 w-full max-w-lg
          animate-slide-up
          rounded-t-2xl bg-surface
          pb-safe
        "
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-6 pb-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[70dvh] overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export { BottomSheet };
export type { BottomSheetProps };
