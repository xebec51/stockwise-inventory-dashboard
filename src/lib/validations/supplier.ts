import { z } from "zod";

const supplierStatuses = ["ACTIVE", "PENDING", "REJECTED", "INACTIVE"] as const;

const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return emptyToUndefined(value);
  },
  z.string().optional()
);

const optionalUrlField = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return emptyToUndefined(value);
  },
  z.url().optional()
);

export const supplierFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Supplier account name is required."),
  email: z.email("Enter a valid email address."),
  password: optionalTrimmedString,
  status: z.enum(supplierStatuses, {
    error: "Select a valid supplier account status.",
  }),
  companyName: z.string().trim().min(1, "Company name is required."),
  contactPerson: optionalTrimmedString,
  phone: optionalTrimmedString,
  supplierCategory: optionalTrimmedString,
  bankAccount: optionalTrimmedString,
  address: optionalTrimmedString,
  avatarUrl: optionalUrlField,
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
export const supplierStatusOptions = supplierStatuses;
