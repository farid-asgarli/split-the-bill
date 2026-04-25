interface QrStickerProps {
  tableNumber: number;
  qrUrl: string;
  restaurantName?: string;
}

export function QrSticker({
  tableNumber,
  qrUrl,
  restaurantName = "Split the Bill",
}: QrStickerProps) {
  return (
    <div
      className="inline-flex flex-col items-center justify-center border border-gray-300 p-4"
      style={{ width: "2in", height: "2.5in" }}
    >
      {qrUrl && (
        <img src={qrUrl} alt={`Table ${tableNumber}`} className="h-28 w-28" />
      )}
      <p className="mt-2 text-xs font-bold">{restaurantName}</p>
      <p className="text-lg font-bold">Table {tableNumber}</p>
      <p className="text-[8px] text-gray-500">Scan to view & pay your bill</p>
    </div>
  );
}
