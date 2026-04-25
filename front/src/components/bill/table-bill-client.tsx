"use client";

import { useState } from "react";
import type { Restaurant, Table, Bill } from "@/types/bill";
import { CheckoutProvider, useCheckout } from "@/hooks/use-checkout";
import { RestaurantHeader } from "@/components/bill/restaurant-header";
import { BillItemList } from "@/components/bill/bill-item-list";
import { BillSummaryBar } from "@/components/bill/bill-summary-bar";
import { TipSelector } from "@/components/bill/tip-selector";
import { PaymentScreen } from "@/components/bill/payment-screen";
import { PaymentConfirmation } from "@/components/bill/payment-confirmation";
import { SplitModeSelector } from "@/components/bill/split-mode-selector";
import { EqualSplit } from "@/components/bill/equal-split";
import { ItemSplit } from "@/components/bill/item-split";

interface TableBillClientProps {
  restaurant: Restaurant;
  table: Table;
  bill: Bill;
}

function TableBillClientInner({
  restaurant,
  table,
  bill,
}: TableBillClientProps) {
  const { step, split } = useCheckout();
  const [splitSheetOpen, setSplitSheetOpen] = useState(false);

  return (
    <div className="mx-auto max-w-lg pb-44">
      <RestaurantHeader restaurant={restaurant} tableNumber={table.number} />

      {/* Bill items — visible on bill and split steps */}
      {(step === "bill" || (step === "split" && split.mode === "none")) && (
        <BillItemList items={bill.items} currency={bill.currency} />
      )}

      {/* Split mode selection bottom sheet */}
      <SplitModeSelector
        open={splitSheetOpen}
        onClose={() => setSplitSheetOpen(false)}
      />

      {/* Split sub-flows */}
      {step === "split" && split.mode === "equal" && (
        <EqualSplit bill={bill} />
      )}
      {step === "split" && split.mode === "by_item" && (
        <ItemSplit bill={bill} />
      )}

      {step === "tip" && <TipSelector bill={bill} />}
      {step === "payment" && <PaymentScreen bill={bill} />}
      {step === "confirmation" && (
        <PaymentConfirmation bill={bill} restaurant={restaurant} />
      )}

      <BillSummaryBar
        bill={bill}
        onSplitOpen={() => setSplitSheetOpen(true)}
      />
    </div>
  );
}

export function TableBillClient({
  restaurant,
  table,
  bill,
}: TableBillClientProps) {
  return (
    <CheckoutProvider bill={bill}>
      <TableBillClientInner restaurant={restaurant} table={table} bill={bill} />
    </CheckoutProvider>
  );
}
