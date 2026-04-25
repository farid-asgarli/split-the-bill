import type { TipOption } from "@/types/bill";

export const TIP_PRESETS: readonly {
  option: TipOption;
  percentage: number;
}[] = [
  { option: "10", percentage: 10 },
  { option: "15", percentage: 15 },
  { option: "20", percentage: 20 },
];

export function calculateTipAmount(
  subtotal: number,
  percentage: number
): number {
  return Math.round(subtotal * (percentage / 100));
}

export function calculateGrandTotal(
  billTotal: number,
  tipAmount: number
): number {
  return billTotal + tipAmount;
}
