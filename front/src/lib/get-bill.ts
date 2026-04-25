import type { BillResponse } from "@/types/bill";
import mockBill from "@/data/mock-bill.json";

export async function getBill(
  tableId: string,
  session?: string
): Promise<BillResponse | null> {
  // In a real app, query the database here.
  // For now, return mock data for any valid-looking request.
  if (!tableId) return null;

  // Simulate session validation
  if (session && session === "expired") return null;

  // Simulate a slight network delay for realistic loading states
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockBill as BillResponse;
}
