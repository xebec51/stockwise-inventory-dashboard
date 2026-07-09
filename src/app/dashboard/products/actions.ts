"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validations/product";

function parseProductFormData(formData: FormData): ProductFormValues {
  return productFormSchema.parse({
    id: formData.get("id")?.toString(),
    categoryId: formData.get("categoryId")?.toString() ?? "",
    name: formData.get("name")?.toString() ?? "",
    sku: formData.get("sku")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    purchasePrice: formData.get("purchasePrice")?.toString() ?? "",
    sellingPrice: formData.get("sellingPrice")?.toString() ?? "",
    currentStock: formData.get("currentStock")?.toString() ?? "",
    minimumStock: formData.get("minimumStock")?.toString() ?? "",
    unit: formData.get("unit")?.toString() ?? "",
    rackLocation: formData.get("rackLocation")?.toString() ?? "",
    imageUrl: formData.get("imageUrl")?.toString() ?? "",
    qrCode: formData.get("qrCode")?.toString() ?? "",
  });
}

function validationErrorState(error: unknown): MutationState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      message: "Database constraint failed. Please refresh and try again.",
    };
  }

  if (error && typeof error === "object" && "flatten" in error) {
    const flattened = (error as { flatten: () => { fieldErrors: Record<string, string[]>; formErrors: string[] } }).flatten();

    return {
      errors: flattened.fieldErrors,
      message: flattened.formErrors[0],
    };
  }

  return {
    message: "Something went wrong. Please try again.",
  };
}

async function ensureProductUniqueFields(
  values: ProductFormValues
): Promise<MutationState | null> {
  const [skuMatch, qrCodeMatch] = await Promise.all([
    prisma.product.findUnique({
      where: { sku: values.sku },
      select: { id: true },
    }),
    values.qrCode
      ? prisma.product.findUnique({
          where: { qrCode: values.qrCode },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (skuMatch && skuMatch.id !== values.id) {
    return {
      errors: {
        sku: ["This SKU is already in use."],
      },
      message: "Choose a different SKU.",
    };
  }

  if (qrCodeMatch && qrCodeMatch.id !== values.id) {
    return {
      errors: {
        qrCode: ["This QR code is already in use."],
      },
      message: "Choose a different QR code.",
    };
  }

  return null;
}

async function ensureCategoryExists(categoryId: string): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  return Boolean(category);
}

function revalidateProductRoutes() {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/categories");
}

export async function createProduct(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const values = parseProductFormData(formData);

    const [uniqueError, categoryExists] = await Promise.all([
      ensureProductUniqueFields(values),
      ensureCategoryExists(values.categoryId),
    ]);

    if (uniqueError) {
      return uniqueError;
    }

    if (!categoryExists) {
      return {
        errors: {
          categoryId: ["Select a valid category."],
        },
        message: "Category could not be found.",
      };
    }

    await prisma.product.create({
      data: {
        categoryId: values.categoryId,
        name: values.name,
        sku: values.sku,
        description: values.description,
        purchasePrice: values.purchasePrice,
        sellingPrice: values.sellingPrice,
        currentStock: values.currentStock,
        minimumStock: values.minimumStock,
        unit: values.unit,
        rackLocation: values.rackLocation,
        imageUrl: values.imageUrl,
        qrCode: values.qrCode,
      },
    });

    revalidateProductRoutes();

    return {
      success: true,
      message: "Product created successfully.",
    };
  } catch (error) {
    return validationErrorState(error);
  }
}

export async function updateProduct(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const values = parseProductFormData(formData);

    if (!values.id) {
      return {
        message: "Missing product identifier.",
      };
    }

    const [uniqueError, categoryExists] = await Promise.all([
      ensureProductUniqueFields(values),
      ensureCategoryExists(values.categoryId),
    ]);

    if (uniqueError) {
      return uniqueError;
    }

    if (!categoryExists) {
      return {
        errors: {
          categoryId: ["Select a valid category."],
        },
        message: "Category could not be found.",
      };
    }

    await prisma.product.update({
      where: { id: values.id },
      data: {
        categoryId: values.categoryId,
        name: values.name,
        sku: values.sku,
        description: values.description,
        purchasePrice: values.purchasePrice,
        sellingPrice: values.sellingPrice,
        currentStock: values.currentStock,
        minimumStock: values.minimumStock,
        unit: values.unit,
        rackLocation: values.rackLocation,
        imageUrl: values.imageUrl,
        qrCode: values.qrCode,
      },
    });

    revalidateProductRoutes();

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    return validationErrorState(error);
  }
}

export async function deleteProduct(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const id = formData.get("id")?.toString();

  if (!id) {
    return {
      message: "Missing product identifier.",
    };
  }

  await prisma.product.delete({
    where: { id },
  });

  revalidateProductRoutes();

  return {
    success: true,
    message: "Product deleted successfully.",
  };
}
