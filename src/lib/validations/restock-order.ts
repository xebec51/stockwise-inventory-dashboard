import { z } from "zod";

const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

const restockOrderItemSchema = z.object({
  productId: z.string().trim().min(1, "Select a product."),
  quantity: z.coerce
    .number({
      error: "Quantity is required.",
    })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
  estimatedPrice: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalized = emptyToUndefined(value);
      return normalized ?? undefined;
    },
    z.coerce
      .number({
        error: "Estimated price must be a valid number.",
      })
      .min(0, "Estimated price must be greater than or equal to 0.")
      .optional()
  ),
});

export const restockOrderFormSchema = z.object({
  managerId: z.string().trim().min(1, "Select the manager account."),
  supplierId: z.string().trim().min(1, "Select a supplier."),
  poNumber: z.string().trim().min(1, "PO number is required."),
  orderDate: z.coerce.date({
    error: "Enter a valid order date.",
  }),
  expectedDeliveryDate: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const normalized = emptyToUndefined(value);
      return normalized ?? undefined;
    },
    z.coerce.date().optional()
  ),
  notes: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
  items: z
    .array(restockOrderItemSchema)
    .min(1, "Add at least one product line.")
    .superRefine((items, context) => {
      const seenProductIds = new Set<string>();

      items.forEach((item, index) => {
        if (seenProductIds.has(item.productId)) {
          context.addIssue({
            code: "custom",
            path: [index, "productId"],
            message: "Each product can only appear once per restock order.",
          });
        }

        seenProductIds.add(item.productId);
      });
    }),
});

export const restockOrderDecisionSchema = z.object({
  id: z.string().trim().min(1, "Missing restock order identifier."),
  actorId: z.string().trim().min(1, "Missing actor identifier."),
  notes: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
});

export const supplierRatingFormSchema = z.object({
  restockOrderId: z.string().trim().min(1, "Missing restock order identifier."),
  managerId: z.string().trim().min(1, "Missing manager identifier."),
  rating: z.coerce
    .number({
      error: "Rating is required.",
    })
    .int("Rating must be a whole number.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot exceed 5."),
  feedback: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
});

export type RestockOrderFormValues = z.infer<typeof restockOrderFormSchema>;
export type RestockOrderDecisionValues = z.infer<
  typeof restockOrderDecisionSchema
>;
export type SupplierRatingFormValues = z.infer<typeof supplierRatingFormSchema>;
