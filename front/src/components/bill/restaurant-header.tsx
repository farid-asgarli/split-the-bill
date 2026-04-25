import type { Restaurant } from "@/types/bill";
import { Badge } from "@/components/ui";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  tableNumber: number;
}

export function RestaurantHeader({
  restaurant,
  tableNumber,
}: RestaurantHeaderProps) {
  return (
    <header className="flex items-center gap-4 px-4 py-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <span className="text-lg font-semibold" aria-hidden="true">
          {restaurant.name.charAt(0)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold text-foreground">
          {restaurant.name}
        </h1>
        <p className="text-sm text-muted">{restaurant.address}</p>
      </div>
      <Badge variant="neutral">Table {tableNumber}</Badge>
    </header>
  );
}
