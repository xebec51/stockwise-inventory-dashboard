import { z } from "zod";

const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

const transactionItemSchema = z.object({
  productId: z.string().trim().min(1, "Select a product."),
  quantity: z.coerce
    .number({
      error: "Quantity is required.",
    })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
});

export const transactionFormSchema = z.object({
  createdById: z.string().trim().min(1, "Select the creator account."),
  type: z.enum(["INCOMING", "OUTGOING"], {
    error: "Select a valid transaction type.",
  }),
  destination: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
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
  transactionDate: z.coerce.date({
    error: "Enter a valid transaction date.",
  }),
  items: z
    .array(transactionItemSchema)
    .min(1, "Add at least one product line.")
    .superRefine((items, context) => {
      const seenProductIds = new Set<string>();

      items.forEach((item, index) => {
        if (seenProductIds.has(item.productId)) {
          context.addIssue({
            code: "custom",
            path: [index, "productId"],
            message: "Each product can only appear once per transaction.",
          });
        }

        seenProductIds.add(item.productId);
      });
    }),
});

export const transactionDecisionSchema = z.object({
  id: z.string().trim().min(1, "Missing transaction identifier."),
  approverId: z.string().trim().min(1, "Select an approver."),
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

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type TransactionDecisionValues = z.infer<typeof transactionDecisionSchema>;
