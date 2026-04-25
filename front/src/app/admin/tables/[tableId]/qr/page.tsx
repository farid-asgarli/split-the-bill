"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth";
import { Button, Card } from "@/components/ui";

export default function TableQrPage() {
  const params = useParams<{ tableId: string }>();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const loadQr = useCallback(async () => {
    setLoading(true);
    const res = await fetchWithAuth(
      `/api/admin/tables/${params.tableId}/qr?format=png`
    );
    if (res.ok) {
      const blob = await res.blob();
      setQrUrl(URL.createObjectURL(blob));
    }
    setLoading(false);
  }, [params.tableId]);

  useEffect(() => {
    loadQr();
  }, [loadQr]);

  async function handleDownload(format: "png" | "svg") {
    const res = await fetchWithAuth(
      `/api/admin/tables/${params.tableId}/qr?format=${format}`
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `table-qr.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleRegenerate() {
    if (!confirm("Regenerate QR code? The old QR will stop working.")) return;
    setRegenerating(true);
    await fetchWithAuth(`/api/admin/tables/${params.tableId}/session/reset`, {
      method: "POST",
    });
    await loadQr();
    setRegenerating(false);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        QR Code for Table
      </h1>

      <Card className="mx-auto max-w-md p-8 text-center">
        {loading ? (
          <div className="mx-auto h-64 w-64 animate-pulse rounded-lg bg-gray-200" />
        ) : qrUrl ? (
          <div className="print-area">
            <img src={qrUrl} alt="QR Code" className="mx-auto h-64 w-64" />
          </div>
        ) : (
          <p className="text-gray-500">Failed to load QR code</p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleDownload("png")}
          >
            Download PNG
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownload("svg")}
          >
            Download SVG
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            Print
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            loading={regenerating}
          >
            Regenerate
          </Button>
        </div>
      </Card>
    </div>
  );
}
