type CurrencyFormatOptions = {
  currency?: string;
  locale?: string;
};

type DateFormatOptions = {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
};

export function formatCurrency(
  value: number | string,
  { currency = "USD", locale = "en-US" }: CurrencyFormatOptions = {}
) {
  const amount = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  value: Date | string,
  { locale = "en-US", options }: DateFormatOptions = {}
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function formatDateTime(
  value: Date | string,
  { locale = "en-US", options }: DateFormatOptions = {}
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}

export function formatStatusLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
