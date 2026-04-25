import { QrSticker } from "./qr-sticker";

interface QrPrintLayoutProps {
  tables: { number: number; qrUrl: string }[];
  restaurantName?: string;
}

export function QrPrintLayout({ tables, restaurantName }: QrPrintLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white print:static print:z-auto">
      <style>{`
        @media print {
          body > *:not(.print-overlay) { display: none !important; }
          .print-overlay { display: block !important; }
        }
      `}</style>
      <div className="print-overlay flex flex-wrap justify-center gap-2 p-4">
        {tables.map((table) => (
          <QrSticker
            key={table.number}
            tableNumber={table.number}
            qrUrl={table.qrUrl}
            restaurantName={restaurantName}
          />
        ))}
      </div>
    </div>
  );
}
