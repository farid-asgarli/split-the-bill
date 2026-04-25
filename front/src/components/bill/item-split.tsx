"use client";

import type { Bill, BillItem } from "@/types/bill";
import { useCheckout } from "@/hooks/use-checkout";
import { CurrencyDisplay, Button, Divider } from "@/components/ui";
import { getCategoryLabel, getCategoryOrder } from "@/lib/format";

interface ItemSplitProps {
  bill: Bill;
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

export function ItemSplit({ bill }: ItemSplitProps) {
  const { split, toggleClaimItem, toggleSharedItem, setStep, clearSplit } =
    useCheckout();

  if (split.mode !== "by_item") return null;

  const { claimedItemIds, sharedItemIds, myShare } = split;
  const groups = groupByCategory(bill.items);
  const hasSelection = claimedItemIds.length > 0 || sharedItemIds.length > 0;

  // Count unclaimed items
  const unclaimedCount = bill.items.filter(
    (item) =>
      !claimedItemIds.includes(item.id) && !sharedItemIds.includes(item.id)
  ).length;

  return (
    <section
      className="animate-fade-in-up px-4 pt-6 pb-8"
      aria-label="Item-based split"
    >
      {/* Back link */}
      <button
        type="button"
        onClick={() => clearSplit()}
        className="mb-4 flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Change split method
      </button>

      <h2 className="mb-1 text-lg font-semibold text-foreground">
        Split by item
      </h2>
      <p className="mb-5 text-sm text-muted">
        Tap items you had. Mark shared items for equal division.
      </p>

      {/* Item list */}
      <div className="space-y-1">
        {groups.map(([category, groupItems], groupIdx) => (
          <div key={category}>
            {groupIdx > 0 && <Divider className="my-1" />}
            <h3 className="pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">
              {getCategoryLabel(category)}
            </h3>
            <ul role="list">
              {groupItems.map((item) => {
                const isClaimed = claimedItemIds.includes(item.id);
                const isShared = sharedItemIds.includes(item.id);

                return (
                  <li key={item.id} className="group">
                    <div
                      className={`
                        flex items-center gap-3 rounded-soft px-3 py-3
                        transition-all duration-150
                        ${
                          isClaimed
                            ? "border-l-3 border-l-primary-500 bg-primary-50/60 dark:bg-primary-950/20"
                            : isShared
                              ? "border-l-3 border-l-accent-400 bg-accent-50/40 dark:bg-accent-900/10"
                              : "border-l-3 border-l-transparent"
                        }
                      `}
                    >
                      {/* Claim checkbox */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isClaimed}
                        aria-label={`Claim ${item.name}`}
                        onClick={() => toggleClaimItem(item.id)}
                        className={`
                          flex h-6 w-6 shrink-0 items-center justify-center
                          rounded-soft border-2 transition-all duration-150
                          focus-visible:outline-none focus-visible:ring-2
                          focus-visible:ring-primary-500/20
                          ${
                            isClaimed
                              ? "border-primary-600 bg-primary-600 text-white"
                              : "border-border hover:border-primary-400"
                          }
                        `}
                      >
                        {isClaimed && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>

                      {/* Item info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between">
                          <span
                            className={`text-[15px] ${isClaimed || isShared ? "text-foreground font-medium" : "text-foreground"}`}
                          >
                            {item.name}
                            {item.quantity > 1 && (
                              <span className="ml-1.5 text-sm text-muted">
                                &times;{item.quantity}
                              </span>
                            )}
                          </span>
                          <CurrencyDisplay
                            amount={item.subtotal}
                            currency={bill.currency}
                            size="sm"
                            className="shrink-0 ml-3 font-medium text-foreground"
                          />
                        </div>
                      </div>

                      {/* Shared toggle */}
                      <button
                        type="button"
                        aria-label={
                          isShared
                            ? `${item.name} is shared — tap to unshare`
                            : `Mark ${item.name} as shared`
                        }
                        aria-pressed={isShared}
                        onClick={() => toggleSharedItem(item.id)}
                        className={`
                          shrink-0 rounded-full px-2.5 py-1
                          text-xs font-medium
                          transition-all duration-150
                          focus-visible:outline-none focus-visible:ring-2
                          focus-visible:ring-primary-500/20
                          ${
                            isShared
                              ? "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400"
                              : "bg-transparent text-muted hover:bg-primary-50 dark:hover:bg-surface-elevated"
                          }
                        `}
                      >
                        {isShared ? (
                          <span className="flex items-center gap-1">
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
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Shared
                          </span>
                        ) : (
                          "Share"
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Unclaimed count notice */}
      {hasSelection && unclaimedCount > 0 && (
        <p className="mt-4 text-center text-sm text-muted">
          {unclaimedCount} item{unclaimedCount !== 1 ? "s" : ""} unclaimed
        </p>
      )}

      {/* Your share summary */}
      <div className="mt-6 rounded-rounded border border-border bg-surface p-4 text-center">
        <p className="mb-1 text-sm text-muted">Your share</p>
        <CurrencyDisplay
          amount={myShare}
          currency={bill.currency}
          size="lg"
          className="text-primary-600"
        />
        {hasSelection && (
          <p className="mt-1 text-xs text-muted">
            Includes proportional tax &amp; service charge
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="mt-4 w-full"
        disabled={!hasSelection}
        onClick={() => setStep("tip")}
      >
        Pay your share
      </Button>
    </section>
  );
}
