import { z } from "zod";

const emptyToUndefined = (value: string) => {
  const trimmed = value.trim();

  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalUrlField = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return emptyToUndefined(value);
  },
  z.url().optional()
);

export const categoryFormSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Category name is required."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be URL-friendly and use lowercase letters, numbers, and hyphens only."
    ),
  description: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      return emptyToUndefined(value);
    },
    z.string().optional()
  ),
  imageUrl: optionalUrlField,
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
