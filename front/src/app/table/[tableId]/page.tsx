import { notFound } from "next/navigation";
import { getBill } from "@/lib/get-bill";
import { TableBillClient } from "@/components/bill/table-bill-client";

export default async function TableBillPage({
  params,
  searchParams,
}: {
  params: Promise<{ tableId: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { tableId } = await params;
  const { session } = await searchParams;

  const data = await getBill(tableId, session);

  if (!data) {
    notFound();
  }

  const { restaurant, table, bill } = data;

  return <TableBillClient restaurant={restaurant} table={table} bill={bill} />;
}
