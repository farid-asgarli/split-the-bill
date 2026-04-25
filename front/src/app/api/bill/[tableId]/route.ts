import { NextResponse } from "next/server";
import { getBill } from "@/lib/get-bill";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;

  if (!tableId) {
    return NextResponse.json(
      { error: "Table ID is required" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session") ?? undefined;

  const data = await getBill(tableId, session);

  if (!data) {
    return NextResponse.json(
      { error: "Table not found or session expired" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
