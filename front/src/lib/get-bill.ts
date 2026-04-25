import type { BillResponse } from "@/types/bill";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5062";

export async function getBill(
  tableId: string,
  session?: string
): Promise<BillResponse | null> {
  if (!tableId) return null;

  const url = new URL(`/api/bill/${tableId}`, BACKEND_URL);
  if (session) url.searchParams.set("session", session);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as BillResponse;
  } catch {
    return null;
  }
}
