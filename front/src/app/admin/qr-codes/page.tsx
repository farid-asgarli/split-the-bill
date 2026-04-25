"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/auth";
import { Button, Card } from "@/components/ui";
import { QrPrintLayout } from "@/components/admin/qr-print-layout";

interface TableInfo {
  id: string;
  number: number;
  hasActiveSession: boolean;
}

export default function QrCodesPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetchWithAuth("/api/admin/tables");
      if (!res.ok) return;
      const data: TableInfo[] = await res.json();
      setTables(data);

      const images: Record<string, string> = {};
      await Promise.all(
        data.map(async (table) => {
          const qrRes = await fetchWithAuth(
            `/api/admin/tables/${table.id}/qr?format=png`
          );
          if (qrRes.ok) {
            const blob = await qrRes.blob();
            images[table.id] = URL.createObjectURL(blob);
          }
        })
      );
      setQrImages(images);
      setLoading(false);
    }
    load();
  }, []);

  function handlePrintAll() {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 100);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All QR Codes</h1>
        {tables.length > 0 && (
          <Button variant="primary" size="sm" onClick={handlePrintAll}>
            Print All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No tables yet. Add tables from the Tables page.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <Card key={table.id} className="p-4 text-center">
              {qrImages[table.id] ? (
                <img
                  src={qrImages[table.id]}
                  alt={`QR code for table ${table.number}`}
                  className="mx-auto mb-3 h-40 w-40"
                />
              ) : (
                <div className="mx-auto mb-3 h-40 w-40 rounded bg-gray-100" />
              )}
              <p className="text-sm font-semibold text-gray-900">
                Table {table.number}
              </p>
            </Card>
          ))}
        </div>
      )}

      {showPrint && (
        <QrPrintLayout
          tables={tables.map((t) => ({
            number: t.number,
            qrUrl: qrImages[t.id] || "",
          }))}
        />
      )}
    </div>
  );
}
