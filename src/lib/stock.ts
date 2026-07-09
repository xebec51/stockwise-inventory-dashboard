export const STOCK_STATUSES = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
] as const;

export type StockStatus = (typeof STOCK_STATUSES)[number];

export function getStockStatus(
  currentStock: number,
  minimumStock: number
): StockStatus {
  if (currentStock <= 0) {
    return "OUT_OF_STOCK";
  }

  if (currentStock <= minimumStock) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

export function isOutOfStock(currentStock: number) {
  return currentStock <= 0;
}

export function isLowStock(currentStock: number, minimumStock: number) {
  return currentStock > 0 && currentStock <= minimumStock;
}

export function isInStock(currentStock: number, minimumStock: number) {
  return currentStock > minimumStock;
}

export function getStockStatusLabel(status: StockStatus) {
  switch (status) {
    case "OUT_OF_STOCK":
      return "Out of Stock";
    case "LOW_STOCK":
      return "Low Stock";
    case "IN_STOCK":
      return "In Stock";
  }
}
