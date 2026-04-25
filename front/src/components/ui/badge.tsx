type BadgeVariant = "success" | "error" | "warning" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  error: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function Badge({ variant = "neutral", className = "", children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        rounded-full px-2.5 py-0.5
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
