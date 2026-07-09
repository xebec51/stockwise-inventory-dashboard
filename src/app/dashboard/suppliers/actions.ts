"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  supplierFormSchema,
  type SupplierFormValues,
} from "@/lib/validations/supplier";

function parseSupplierFormData(formData: FormData): SupplierFormValues {
  return supplierFormSchema.parse({
    id: formData.get("id")?.toString(),
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    status: formData.get("status")?.toString() ?? "",
    companyName: formData.get("companyName")?.toString() ?? "",
    contactPerson: formData.get("contactPerson")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
    supplierCategory: formData.get("supplierCategory")?.toString() ?? "",
    bankAccount: formData.get("bankAccount")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
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

function revalidateSupplierRoutes() {
  revalidatePath("/dashboard/suppliers");
}

async function ensureUniqueSupplierEmail(
  email: string,
  supplierId?: string
): Promise<MutationState | null> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      supplierProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!existingUser) {
    return null;
  }

  if (existingUser.supplierProfile?.id !== supplierId) {
    return {
      errors: {
        email: ["This email address is already in use."],
      },
      message: "Choose a different supplier account email.",
    };
  }

  return null;
}

function requirePassword(values: SupplierFormValues): MutationState | null {
  if (!values.password) {
    return {
      errors: {
        password: ["Password is required when creating a supplier account."],
      },
      message: "Set a password for the supplier account.",
    };
  }

  if (values.password.length < 8) {
    return {
      errors: {
        password: ["Password must be at least 8 characters long."],
      },
      message: "Use a stronger supplier password.",
    };
  }

  return null;
}

export async function createSupplier(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    await requireCurrentUser(["ADMIN"]);
    const values = parseSupplierFormData(formData);
    const emailError = await ensureUniqueSupplierEmail(values.email);

    if (emailError) {
      return emailError;
    }

    const passwordError = requirePassword(values);

    if (passwordError) {
      return passwordError;
    }

    const passwordHash = await bcrypt.hash(values.password!, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: values.name,
          email: values.email,
          password: passwordHash,
          role: "SUPPLIER",
          status: values.status,
          phone: values.phone,
          avatarUrl: values.avatarUrl,
        },
        select: {
          id: true,
        },
      });

      await tx.supplier.create({
        data: {
          userId: user.id,
          companyName: values.companyName,
          address: values.address,
          contactPerson: values.contactPerson,
          phone: values.phone,
          supplierCategory: values.supplierCategory,
          bankAccount: values.bankAccount,
        },
      });
    });

    revalidateSupplierRoutes();

    return {
      success: true,
      message: "Supplier created successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only admins can manage supplier accounts.",
      };
    }

    return validationErrorState(error);
  }
}

export async function updateSupplier(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    await requireCurrentUser(["ADMIN"]);
    const values = parseSupplierFormData(formData);

    if (!values.id) {
      return {
        message: "Missing supplier identifier.",
      };
    }

    const emailError = await ensureUniqueSupplierEmail(values.email, values.id);

    if (emailError) {
      return emailError;
    }

    const passwordHash = values.password
      ? await bcrypt.hash(values.password, 10)
      : null;

    const supplier = await prisma.supplier.findUnique({
      where: { id: values.id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!supplier) {
      return {
        message: "Supplier not found.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: supplier.userId },
        data: {
          name: values.name,
          email: values.email,
          status: values.status,
          phone: values.phone,
          avatarUrl: values.avatarUrl,
          ...(passwordHash ? { password: passwordHash } : {}),
        },
      });

      await tx.supplier.update({
        where: { id: supplier.id },
        data: {
          companyName: values.companyName,
          address: values.address,
          contactPerson: values.contactPerson,
          phone: values.phone,
          supplierCategory: values.supplierCategory,
          bankAccount: values.bankAccount,
        },
      });
    });

    revalidateSupplierRoutes();

    return {
      success: true,
      message: "Supplier updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only admins can manage supplier accounts.",
      };
    }

    return validationErrorState(error);
  }
}

export async function deleteSupplier(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    await requireCurrentUser(["ADMIN"]);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only admins can manage supplier accounts.",
      };
    }

    return {
      message: "You must be signed in to delete suppliers.",
    };
  }

  const id = formData.get("id")?.toString();

  if (!id) {
    return {
      message: "Missing supplier identifier.",
    };
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      _count: {
        select: {
          restockOrders: true,
          supplierRatings: true,
        },
      },
      user: {
        select: {
          _count: {
            select: {
              activityLogs: true,
              createdTransactions: true,
              approvedTransactions: true,
              managedRestockOrders: true,
              supplierRatingsGiven: true,
            },
          },
        },
      },
    },
  });

  if (!supplier) {
    return {
      message: "Supplier not found.",
    };
  }

  if (supplier._count.restockOrders > 0 || supplier._count.supplierRatings > 0) {
    return {
      message:
        "This supplier already has restock or rating history. Keep the record for auditability instead of deleting it.",
    };
  }

  const userDependencies =
    supplier.user._count.activityLogs +
    supplier.user._count.createdTransactions +
    supplier.user._count.approvedTransactions +
    supplier.user._count.managedRestockOrders +
    supplier.user._count.supplierRatingsGiven;

  if (userDependencies > 0) {
    return {
      message:
        "This supplier account is referenced by operational history and cannot be deleted safely.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.supplier.delete({
      where: { id: supplier.id },
    });

    await tx.user.delete({
      where: { id: supplier.userId },
    });
  });

  revalidateSupplierRoutes();

  return {
    success: true,
    message: "Supplier deleted successfully.",
  };
}
