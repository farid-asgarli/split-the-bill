import type { BillItem } from "@/types/bill";
import { CurrencyDisplay, Divider } from "@/components/ui";
import { getCategoryLabel, getCategoryOrder } from "@/lib/format";

interface BillItemListProps {
  items: BillItem[];
  currency: string;
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

export function BillItemList({ items, currency }: BillItemListProps) {
  const groups = groupByCategory(items);
  let itemIndex = 0;

  return (
    <div className="px-4">
      {groups.map(([category, groupItems], groupIdx) => (
        <section key={category}>
          {groupIdx > 0 && <Divider className="my-1" />}
          <h2 className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {getCategoryLabel(category)}
          </h2>
          <ul role="list">
            {groupItems.map((item) => {
              const delay = itemIndex * 50;
              itemIndex++;
              return (
                <li
                  key={item.id}
                  className="animate-fade-in-up flex items-baseline justify-between py-2.5"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="text-[15px] text-foreground">
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-sm text-muted">
                        &times;{item.quantity}
                      </span>
                    )}
                  </div>
                  <CurrencyDisplay
                    amount={item.subtotal}
                    currency={currency}
                    size="sm"
                    className="shrink-0 font-medium text-foreground"
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
