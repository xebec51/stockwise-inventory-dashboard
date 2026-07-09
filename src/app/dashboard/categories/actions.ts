"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/validations/category";

function parseCategoryFormData(formData: FormData): CategoryFormValues {
  return categoryFormSchema.parse({
    id: formData.get("id")?.toString(),
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    imageUrl: formData.get("imageUrl")?.toString() ?? "",
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

async function ensureUniqueCategorySlug(
  slug: string,
  id?: string
): Promise<MutationState | null> {
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingCategory && existingCategory.id !== id) {
    return {
      errors: {
        slug: ["This slug is already in use."],
      },
      message: "Choose a different category slug.",
    };
  }

  return null;
}

function revalidateCategoryRoutes() {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
}

export async function createCategory(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const values = parseCategoryFormData(formData);
    const slugError = await ensureUniqueCategorySlug(values.slug);

    if (slugError) {
      return slugError;
    }

    await prisma.category.create({
      data: {
        name: values.name,
        slug: values.slug,
        description: values.description,
        imageUrl: values.imageUrl,
      },
    });

    revalidateCategoryRoutes();

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return validationErrorState(error);
    }

    if (error instanceof Error && "issues" in error) {
      return validationErrorState(error);
    }

    return validationErrorState(error);
  }
}

export async function updateCategory(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const values = parseCategoryFormData(formData);

    if (!values.id) {
      return {
        message: "Missing category identifier.",
      };
    }

    const slugError = await ensureUniqueCategorySlug(values.slug, values.id);

    if (slugError) {
      return slugError;
    }

    await prisma.category.update({
      where: { id: values.id },
      data: {
        name: values.name,
        slug: values.slug,
        description: values.description,
        imageUrl: values.imageUrl,
      },
    });

    revalidateCategoryRoutes();

    return {
      success: true,
      message: "Category updated successfully.",
    };
  } catch (error) {
    return validationErrorState(error);
  }
}

export async function deleteCategory(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const id = formData.get("id")?.toString();

  if (!id) {
    return {
      message: "Missing category identifier.",
    };
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return {
      message: "Category not found.",
    };
  }

  if (category._count.products > 0) {
    return {
      message:
        "This category still has products assigned to it. Move or delete those products before deleting the category.",
    };
  }

  await prisma.category.delete({
    where: { id },
  });

  revalidateCategoryRoutes();

  return {
    success: true,
    message: "Category deleted successfully.",
  };
}
