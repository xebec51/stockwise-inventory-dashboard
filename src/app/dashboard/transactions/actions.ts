"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { Prisma, TransactionType } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  transactionDecisionSchema,
  transactionFormSchema,
  type TransactionDecisionValues,
  type TransactionFormValues,
} from "@/lib/validations/transaction";

function parseTransactionItems(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTransactionFormData(formData: FormData): TransactionFormValues {
  return transactionFormSchema.parse({
    createdById: formData.get("createdById")?.toString() ?? "",
    type: formData.get("type")?.toString() ?? "",
    destination: formData.get("destination")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
    transactionDate: formData.get("transactionDate")?.toString() ?? "",
    items: parseTransactionItems(formData.get("items")),
  });
}

function parseTransactionDecisionFormData(
  formData: FormData
): TransactionDecisionValues {
  return transactionDecisionSchema.parse({
    id: formData.get("id")?.toString() ?? "",
    approverId: formData.get("approverId")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
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

function revalidateTransactionRoutes() {
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}

async function generateTransactionNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `TX-${datePart}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        transactionNumber: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existingTransaction) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique transaction number.");
}

async function ensureCreatorExists(createdById: string) {
  return prisma.user.findFirst({
    where: {
      id: createdById,
      status: "ACTIVE",
      role: {
        in: ["ADMIN", "MANAGER", "STAFF"],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
}

function getApprovalStatus(type: TransactionType) {
  return type === "INCOMING" ? "COMPLETED" : "APPROVED";
}

function buildCreateDescription(
  transactionNumber: string,
  values: TransactionFormValues,
  itemCount: number
) {
  return `Created ${values.type.toLowerCase()} transaction ${transactionNumber} with ${itemCount} product line${itemCount === 1 ? "" : "s"}.`;
}

function buildDecisionDescription(
  transactionNumber: string,
  decision: "APPROVE" | "REJECT",
  approverName: string
) {
  const verb = decision === "APPROVE" ? "Approved" : "Rejected";

  return `${verb} transaction ${transactionNumber} by ${approverName}.`;
}

export async function createTransaction(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const sessionUser = await requireCurrentUser(["ADMIN", "STAFF"]);
    const values = parseTransactionFormData(formData);
    const creator = await ensureCreatorExists(sessionUser.id);

    if (!creator) {
      return {
        errors: {
          createdById: ["Select an active internal user."],
        },
        message: "Transaction creator could not be found.",
      };
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: values.items.map((item) => item.productId),
        },
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
      },
    });

    if (products.length !== values.items.length) {
      return {
        errors: {
          items: ["One or more selected products no longer exist."],
        },
        message: "Refresh the page and reselect the product lines.",
      };
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    if (values.type === "OUTGOING") {
      const insufficientItem = values.items.find((item) => {
        const product = productMap.get(item.productId);
        return product ? item.quantity > product.currentStock : false;
      });

      if (insufficientItem) {
        const product = productMap.get(insufficientItem.productId);

        return {
          errors: {
            items: [
              `${product?.name ?? "Selected product"} does not have enough available stock for this outgoing request.`,
            ],
          },
          message:
            "Outgoing transactions cannot request more stock than is currently available.",
        };
      }
    }

    const transactionNumber = await generateTransactionNumber();

    await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactionNumber,
            createdById: sessionUser.id,
            type: values.type,
            status: "PENDING",
            destination: values.destination,
            notes: values.notes,
            transactionDate: values.transactionDate,
          },
          select: {
            id: true,
          },
        });

        await tx.transactionItem.createMany({
          data: values.items.map((item) => {
            const product = productMap.get(item.productId)!;

            return {
              transactionId: transaction.id,
              productId: item.productId,
              quantity: item.quantity,
              stockBefore: product.currentStock,
              stockAfter: product.currentStock,
            };
          }),
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "CREATE",
            module: "TRANSACTIONS",
            description: buildCreateDescription(
              transactionNumber,
              values,
              values.items.length
            ),
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateTransactionRoutes();

    return {
      success: true,
      message: "Transaction created successfully and is now pending review.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only staff and admins can create transactions.",
      };
    }

    return validationErrorState(error);
  }
}

export async function approveTransaction(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const sessionUser = await requireCurrentUser(["ADMIN", "MANAGER"]);
    const values = parseTransactionDecisionFormData(formData);

    const approvedAt = new Date();

    const approvalResult = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.findUnique({
          where: {
            id: values.id,
          },
          select: {
            id: true,
            transactionNumber: true,
            type: true,
            status: true,
            notes: true,
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    currentStock: true,
                  },
                },
              },
            },
          },
        });

        if (!transaction) {
          return {
            ok: false as const,
            state: {
              message: "Transaction not found.",
            },
          };
        }

        if (transaction.status !== "PENDING") {
          return {
            ok: false as const,
            state: {
              message: "Only pending transactions can be approved.",
            },
          };
        }

        for (const item of transaction.items) {
          if (
            transaction.type === "OUTGOING" &&
            item.quantity > item.product.currentStock
          ) {
            return {
              ok: false as const,
              state: {
                message: `${item.product.name} no longer has enough stock to approve this outgoing transaction.`,
              },
            };
          }
        }

        for (const item of transaction.items) {
          const stockBefore = item.product.currentStock;
          const stockAfter =
            transaction.type === "INCOMING"
              ? stockBefore + item.quantity
              : stockBefore - item.quantity;

          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              currentStock: stockAfter,
            },
          });

          await tx.transactionItem.update({
            where: {
              id: item.id,
            },
            data: {
              stockBefore,
              stockAfter,
            },
          });
        }

        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: getApprovalStatus(transaction.type),
            approvedById: sessionUser.id,
            approvedAt,
            notes: values.notes
              ? transaction.notes
                ? `${transaction.notes}\n\nApproval note: ${values.notes}`
                : `Approval note: ${values.notes}`
              : transaction.notes,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "APPROVE",
            module: "TRANSACTIONS",
            description: buildDecisionDescription(
              transaction.transactionNumber,
              "APPROVE",
              sessionUser.name ?? "Manager"
            ),
            ipAddress: "127.0.0.1",
          },
        });

        return {
          ok: true as const,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (!approvalResult.ok) {
      return approvalResult.state;
    }

    revalidateTransactionRoutes();

    return {
      success: true,
      message: "Transaction approved and stock levels were updated.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only managers and admins can approve transactions.",
      };
    }

    return validationErrorState(error);
  }
}

export async function rejectTransaction(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  try {
    const sessionUser = await requireCurrentUser(["ADMIN", "MANAGER"]);
    const values = parseTransactionDecisionFormData(formData);

    const rejectedAt = new Date();

    const rejectionResult = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.findUnique({
          where: {
            id: values.id,
          },
          select: {
            id: true,
            transactionNumber: true,
            notes: true,
            status: true,
          },
        });

        if (!transaction) {
          return {
            ok: false as const,
            state: {
              message: "Transaction not found.",
            },
          };
        }

        if (transaction.status !== "PENDING") {
          return {
            ok: false as const,
            state: {
              message: "Only pending transactions can be rejected.",
            },
          };
        }

        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: "REJECTED",
            approvedById: sessionUser.id,
            approvedAt: rejectedAt,
            notes: values.notes
              ? transaction.notes
                ? `${transaction.notes}\n\nRejection note: ${values.notes}`
                : `Rejection note: ${values.notes}`
              : transaction.notes,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "REJECT",
            module: "TRANSACTIONS",
            description: buildDecisionDescription(
              transaction.transactionNumber,
              "REJECT",
              sessionUser.name ?? "Manager"
            ),
            ipAddress: "127.0.0.1",
          },
        });

        return {
          ok: true as const,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (!rejectionResult.ok) {
      return rejectionResult.state;
    }

    revalidateTransactionRoutes();

    return {
      success: true,
      message: "Transaction rejected without changing stock.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only managers and admins can reject transactions.",
      };
    }

    return validationErrorState(error);
  }
}
