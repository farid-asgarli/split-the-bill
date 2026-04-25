interface DividerProps {
  label?: string;
  className?: string;
}

function Divider({ label, className = "" }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`} role="separator">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }

  return (
    <hr
      className={`h-px border-0 bg-border ${className}`}
      role="separator"
    />
  );
}

export { Divider };
export type { DividerProps };
