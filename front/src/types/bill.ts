export type BillItemCategory = "starters" | "mains" | "desserts" | "drinks";

export interface BillItem {
  id: string;
  name: string;
  category: BillItemCategory;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TaxInfo {
  label: string;
  rate: number;
  amount: number;
}

export interface ServiceCharge {
  label: string;
  rate: number;
  amount: number;
}

export type BillStatus = "open" | "partial" | "paid";

export interface Bill {
  id: string;
  status: BillStatus;
  createdAt: string;
  currency: string;
  items: BillItem[];
  subtotal: number;
  tax: TaxInfo;
  serviceCharge: ServiceCharge;
  total: number;
  amountPaid: number;
  amountRemaining: number;
}

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  address: string;
}

export interface Table {
  id: string;
  number: number;
  session: string;
}

export interface BillResponse {
  restaurant: Restaurant;
  table: Table;
  bill: Bill;
}

/* ── Checkout flow types ── */

export type TipOption = "none" | "10" | "15" | "20" | "custom";

export interface TipState {
  option: TipOption;
  percentage: number | null;
  amount: number;
}

export type PaymentMethod = "apple_pay" | "google_pay" | "card";

export type PaymentStatus = "idle" | "processing" | "success" | "error";

export interface PaymentState {
  method: PaymentMethod | null;
  status: PaymentStatus;
  errorMessage?: string;
}

export type CheckoutStep =
  | "bill"
  | "split"
  | "tip"
  | "payment"
  | "confirmation";

/* ── Split types ── */

export type SplitMode = "none" | "equal" | "by_item" | "custom";

interface NoSplitState {
  mode: "none";
}

export interface EqualSplitState {
  mode: "equal";
  headCount: number;
  myShare: number;
}

export interface ItemSplitState {
  mode: "by_item";
  claimedItemIds: string[];
  sharedItemIds: string[];
  myShare: number;
}

export interface CustomSplitState {
  mode: "custom";
  myAmount: number;
}

export type SplitState =
  | NoSplitState
  | EqualSplitState
  | ItemSplitState
  | CustomSplitState;
