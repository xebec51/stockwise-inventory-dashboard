import { z } from "zod";

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

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Your name is required."),
  email: z.email("Enter a valid email address."),
  phone: optionalTrimmedString,
  avatarUrl: optionalUrlField,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "New password and confirmation do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
