const CATEGORY_ORDER: Record<string, number> = {
  starters: 0,
  mains: 1,
  desserts: 2,
  drinks: 3,
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  en: {
    starters: "Starters",
    mains: "Mains",
    desserts: "Desserts",
    drinks: "Drinks",
  },
  az: {
    starters: "Qəlyanaltılar",
    mains: "Əsas yeməklər",
    desserts: "Desertlər",
    drinks: "İçkilər",
  },
};

export function getCategoryLabel(
  category: string,
  locale: string = "en"
): string {
  return (
    CATEGORY_LABELS[locale]?.[category] ??
    CATEGORY_LABELS["en"]?.[category] ??
    category
  );
}

export function getCategoryOrder(category: string): number {
  return CATEGORY_ORDER[category] ?? 99;
}

/** Map our locale codes to BCP-47 locale strings for Intl APIs */
export function toIntlLocale(locale: string): string {
  const map: Record<string, string> = { en: "az-AZ", az: "az-AZ" };
  return map[locale] ?? locale;
}

export function formatCurrency(
  amount: number,
  currency: string = "AZN",
  locale: string = "az-AZ"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function announceCurrency(
  amount: number,
  currency: string = "AZN"
): string {
  // Screen reader friendly: "1,200 Indian rupees"
  const formatted = new Intl.NumberFormat("az-AZ", {
    style: "currency",
    currency,
    currencyDisplay: "name",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}
