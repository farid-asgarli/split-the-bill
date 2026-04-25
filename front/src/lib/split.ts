import type { Bill } from "@/types/bill";

/**
 * Equal-split: divide total among headCount people.
 * Returns the per-person share. The last payer absorbs
 * rounding so no rupee is lost.
 */
export function calculateEqualShare(
  total: number,
  headCount: number
): { perPerson: number; lastPerson: number } {
  if (headCount < 2) return { perPerson: total, lastPerson: total };

  const perPerson = Math.floor(total / headCount);
  const lastPerson = total - perPerson * (headCount - 1);

  return { perPerson, lastPerson };
}

/**
 * Item-based split: sums claimed items + proportional share of
 * shared items, then applies proportional tax & service charge.
 */
export function calculateItemShare(
  bill: Bill,
  claimedItemIds: string[],
  sharedItemIds: string[],
  sharedHeadCount: number = 2
): number {
  if (claimedItemIds.length === 0 && sharedItemIds.length === 0) return 0;

  const itemMap = new Map(bill.items.map((i) => [i.id, i]));

  // Sum claimed items
  let claimedSubtotal = 0;
  for (const id of claimedItemIds) {
    const item = itemMap.get(id);
    if (item) claimedSubtotal += item.subtotal;
  }

  // Sum shared items (proportional)
  let sharedSubtotal = 0;
  for (const id of sharedItemIds) {
    const item = itemMap.get(id);
    if (item) sharedSubtotal += item.subtotal;
  }
  const mySharedPortion =
    sharedHeadCount > 0
      ? Math.round(sharedSubtotal / sharedHeadCount)
      : 0;

  const myItemSubtotal = claimedSubtotal + mySharedPortion;

  // Proportional tax & service charge based on share of subtotal
  const proportion =
    bill.subtotal > 0 ? myItemSubtotal / bill.subtotal : 0;

  const myTax = Math.round(bill.tax.amount * proportion);
  const myService = Math.round(bill.serviceCharge.amount * proportion);

  return myItemSubtotal + myTax + myService;
}

/**
 * Clamp a custom amount to the valid range [0, remaining].
 */
export function clampCustomAmount(
  amount: number,
  remaining: number
): number {
  return Math.max(0, Math.min(amount, remaining));
}
