import type { BillItem } from "@/types/bill";
import { CurrencyDisplay, Divider } from "@/components/ui";
import { getCategoryLabel, getCategoryOrder } from "@/lib/format";
import { useI18n } from "@/hooks/use-i18n";

interface BillItemListProps {
  items: BillItem[];
  currency: string;
  paidItemIds?: string[];
  lockedItemIds?: string[];
}

function groupByCategory(items: BillItem[]) {
  const groups = new Map<string, BillItem[]>();

  for (const item of items) {
    const existing = groups.get(item.category) ?? [];
    existing.push(item);
    groups.set(item.category, existing);
  }

  return [...groups.entries()].sort(
    ([a], [b]) => getCategoryOrder(a) - getCategoryOrder(b)
  );
}

export function BillItemList({
  items,
  currency,
  paidItemIds = [],
  lockedItemIds = [],
}: BillItemListProps) {
  const groups = groupByCategory(items);
  const { locale } = useI18n();
  const paidSet = new Set(paidItemIds);
  const lockedSet = new Set(lockedItemIds);
  let itemIndex = 0;

  return (
    <div className="px-4">
      {groups.map(([category, groupItems], groupIdx) => (
        <section key={category}>
          {groupIdx > 0 && <Divider className="my-1" />}
          <h2 className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {getCategoryLabel(category, locale)}
          </h2>
          <ul role="list">
            {groupItems.map((item) => {
              const delay = itemIndex * 50;
              itemIndex++;
              const isPaid = paidSet.has(item.id);
              const isLocked = lockedSet.has(item.id);
              return (
                <li
                  key={item.id}
                  className={`animate-fade-in-up flex items-baseline justify-between py-2.5 ${
                    isPaid ? "opacity-45" : isLocked ? "opacity-60" : ""
                  }`}
                  style={{ animationDelay: `${delay}ms` }}
                  aria-label={
                    isPaid
                      ? `${item.name} — paid`
                      : isLocked
                        ? `${item.name} — payment in progress`
                        : undefined
                  }
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <span
                      className={`text-[15px] ${isPaid ? "line-through text-muted" : "text-foreground"}`}
                    >
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-sm text-muted">
                        &times;{item.quantity}
                      </span>
                    )}
                    {isPaid && (
                      <span className="ml-2 inline-flex items-center text-xs text-success">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="ml-0.5">Paid</span>
                      </span>
                    )}
                    {isLocked && !isPaid && (
                      <span className="ml-2 inline-flex items-center text-xs text-warning">
                        <span className="mr-0.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                        Processing
                      </span>
                    )}
                  </div>
                  <CurrencyDisplay
                    amount={item.subtotal}
                    currency={currency}
                    size="sm"
                    className={`shrink-0 font-medium ${isPaid ? "text-muted line-through" : "text-foreground"}`}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
