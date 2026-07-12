"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  passwordChangeSchema,
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";

function parseProfileFormData(formData: FormData): ProfileFormValues {
  return profileFormSchema.parse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    avatarUrl: formData.get("avatarUrl")?.toString() ?? "",
  });
}

function validationErrorState(error: unknown): MutationState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      message: "Database constraint failed. Please refresh and try again.",
    };
  }

  if (error && typeof error === "object" && "flatten" in error) {
    const flattened = (
      error as {
        flatten: () => {
          fieldErrors: Record<string, string[]>;
          formErrors: string[];
        };
      }
    ).flatten();

    return {
      errors: flattened.fieldErrors,
      message: flattened.formErrors[0],
    };
  }

  return {
    message: "Something went wrong. Please try again.",
  };
}

function revalidateProfileRoutes() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");
}

async function requireSignedInUser(): Promise<MutationState | null> {
  try {
    await requireCurrentUser();
    return null;
  } catch {
    return {
      message: "You must be signed in to manage your profile.",
    };
  }
}

export async function updateProfile(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const authError = await requireSignedInUser();

  if (authError) {
    return authError;
  }

  try {
    const sessionUser = await requireCurrentUser();
    const values = parseProfileFormData(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== sessionUser.id) {
      return {
        errors: {
          email: ["This email address is already in use."],
        },
        message: "Choose a different email address.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: sessionUser.id },
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          avatarUrl: values.avatarUrl,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: sessionUser.id,
          action: "UPDATE",
          module: "PROFILE",
          description: "Updated personal profile details.",
          ipAddress: "127.0.0.1",
        },
      });
    });

    revalidateProfileRoutes();

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    return validationErrorState(error);
  }
}

export async function changePassword(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const authError = await requireSignedInUser();

  if (authError) {
    return authError;
  }

  try {
    const sessionUser = await requireCurrentUser();
    const values = passwordChangeSchema.parse({
      currentPassword: formData.get("currentPassword")?.toString() ?? "",
      newPassword: formData.get("newPassword")?.toString() ?? "",
      confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
    });

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return { message: "Account not found." };
    }

    const currentPasswordMatches = await bcrypt.compare(
      values.currentPassword,
      user.password
    );

    if (!currentPasswordMatches) {
      return {
        errors: {
          currentPassword: ["Current password is incorrect."],
        },
        message: "Current password is incorrect.",
      };
    }

    const passwordHash = await bcrypt.hash(values.newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: passwordHash },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "UPDATE",
          module: "PROFILE",
          description: "Changed account password.",
          ipAddress: "127.0.0.1",
        },
      });
    });

    revalidateProfileRoutes();

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    return validationErrorState(error);
  }
}
