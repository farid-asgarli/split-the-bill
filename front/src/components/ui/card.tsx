import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-rounded
          ${elevated ? "bg-surface-elevated shadow-elevated" : "bg-surface shadow-card"}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
