"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface StepTransitionProps {
  stepKey: string;
  children: ReactNode;
  className?: string;
}

const STEP_LABELS: Record<string, string> = {
  bill: "Bill view",
  "split-none": "Split mode selection",
  "split-equal": "Equal split",
  "split-by_item": "Item-based split",
  "split-custom": "Custom amount split",
  tip: "Tip selection",
  payment: "Payment",
  confirmation: "Payment confirmed",
};

/**
 * Wraps checkout step content with a slide-up + fade-in entrance animation.
 * On step change, the new content slides up smoothly.
 * Moves focus to the new step for screen reader users.
 * Respects prefers-reduced-motion (handled globally via CSS).
 */
export function StepTransition({
  stepKey,
  children,
  className = "",
}: StepTransitionProps) {
  const [visible, setVisible] = useState(false);
  const prevKey = useRef(stepKey);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stepKey !== prevKey.current) {
      setVisible(false);
      const timer = setTimeout(() => {
        setVisible(true);
        prevKey.current = stepKey;
        // Move focus to the new step content
        wrapperRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [stepKey]);

  const label = STEP_LABELS[stepKey];

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      role="region"
      aria-label={label}
      className={`step-transition ${visible ? "step-transition-enter" : "step-transition-exit"} outline-none ${className}`}
    >
      {children}
    </div>
  );
}
