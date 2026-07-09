import { z } from "zod";

const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

const nonNegativeNumber = (label: string) =>
  z.coerce
    .number({
      error: `${label} is required.`,
    })
    .min(0, `${label} must be greater than or equal to 0.`);

const optionalUrlField = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return emptyToUndefined(value);
  },
  z.url().optional()
);

export const productFormSchema = z.object({
  id: z.string().trim().optional(),
  categoryId: z.string().trim().min(1, "Category is required."),
  name: z.string().trim().min(1, "Product name is required."),
  sku: z.string().trim().min(1, "SKU is required."),
  description: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
  purchasePrice: nonNegativeNumber("Purchase price"),
  sellingPrice: nonNegativeNumber("Selling price"),
  currentStock: nonNegativeNumber("Current stock").int(
    "Current stock must be a whole number."
  ),
  minimumStock: nonNegativeNumber("Minimum stock").int(
    "Minimum stock must be a whole number."
  ),
  unit: z.string().trim().min(1, "Unit is required."),
  rackLocation: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
  imageUrl: optionalUrlField,
  qrCode: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
