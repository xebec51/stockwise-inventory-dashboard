"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

import { type MutationState } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withSerializableRetry } from "@/lib/prisma-transaction";
import { getStockAfterMovement } from "@/lib/stock";
import {
  restockOrderDecisionSchema,
  restockOrderFormSchema,
  supplierRatingFormSchema,
  type RestockOrderDecisionValues,
  type RestockOrderFormValues,
  type SupplierRatingFormValues,
} from "@/lib/validations/restock-order";

function parseRestockOrderItems(rawValue: FormDataEntryValue | null) {
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

function parseRestockOrderFormData(formData: FormData): RestockOrderFormValues {
  return restockOrderFormSchema.parse({
    managerId: formData.get("managerId")?.toString() ?? "",
    supplierId: formData.get("supplierId")?.toString() ?? "",
    poNumber: formData.get("poNumber")?.toString() ?? "",
    orderDate: formData.get("orderDate")?.toString() ?? "",
    expectedDeliveryDate: formData.get("expectedDeliveryDate")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
    items: parseRestockOrderItems(formData.get("items")),
  });
}

function parseRestockDecisionFormData(
  formData: FormData
): RestockOrderDecisionValues {
  return restockOrderDecisionSchema.parse({
    id: formData.get("id")?.toString() ?? "",
    actorId: formData.get("actorId")?.toString() ?? "",
    notes: formData.get("notes")?.toString() ?? "",
  });
}

function parseSupplierRatingFormData(
  formData: FormData
): SupplierRatingFormValues {
  return supplierRatingFormSchema.parse({
    restockOrderId: formData.get("restockOrderId")?.toString() ?? "",
    managerId: formData.get("managerId")?.toString() ?? "",
    rating: formData.get("rating")?.toString() ?? "",
    feedback: formData.get("feedback")?.toString() ?? "",
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

function revalidateRestockRoutes() {
  revalidatePath("/dashboard/restock-orders");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/suppliers");
  revalidatePath("/dashboard");
}

async function lockRestockOrderForUpdate(
  client: Pick<typeof prisma, "$queryRaw">,
  restockOrderId: string
) {
  await client.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM restock_orders
    WHERE id = ${restockOrderId}
    FOR UPDATE
  `;
}

async function lockProductsForUpdate(
  client: Pick<typeof prisma, "$queryRaw">,
  productIds: string[]
) {
  const sortedIds = [...new Set(productIds)].sort();

  if (sortedIds.length === 0) return;

  await client.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM products
    WHERE id IN (${Prisma.join(sortedIds)})
    ORDER BY id
    FOR UPDATE
  `;
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

async function ensureUniquePoNumber(poNumber: string) {
  const existingOrder = await prisma.restockOrder.findUnique({
    where: { poNumber },
    select: { id: true },
  });

  if (existingOrder) {
    return {
      errors: {
        poNumber: ["This PO number is already in use."],
      },
      message: "Choose a different PO number.",
    } satisfies MutationState;
  }

  return null;
}

async function ensureManagerExists(managerId: string) {
  return prisma.user.findFirst({
    where: {
      id: managerId,
      status: "ACTIVE",
      role: {
        in: ["ADMIN", "MANAGER"],
      },
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });
}

async function ensureSupplierExists(supplierId: string) {
  return prisma.supplier.findFirst({
    where: {
      id: supplierId,
      user: {
        status: "ACTIVE",
        role: "SUPPLIER",
      },
    },
    select: {
      id: true,
      companyName: true,
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });
}

function appendNote(
  existingNotes: string | null,
  label: string,
  note?: string
) {
  if (!note) {
    return existingNotes;
  }

  return existingNotes
    ? `${existingNotes}\n\n${label}: ${note}`
    : `${label}: ${note}`;
}

function describeRestockAction(
  action: string,
  poNumber: string,
  actorName: string
) {
  return `${action} restock order ${poNumber} by ${actorName}.`;
}

async function loadRestockOrderForDecision(
  id: string,
  client: Pick<typeof prisma, "restockOrder"> = prisma
) {
  return client.restockOrder.findUnique({
    where: { id },
    select: {
      id: true,
      poNumber: true,
      managerId: true,
      supplierId: true,
      status: true,
      notes: true,
      sourceTransaction: {
        select: {
          id: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
        },
      },
      supplier: {
        select: {
          id: true,
          companyName: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              status: true,
            },
          },
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          estimatedPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              currentStock: true,
            },
          },
        },
      },
      supplierRating: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function createRestockOrder(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["ADMIN", "MANAGER"]);

  try {
    const values = parseRestockOrderFormData(formData);
    const [poNumberError, manager, supplier] = await Promise.all([
      ensureUniquePoNumber(values.poNumber),
      ensureManagerExists(sessionUser.id),
      ensureSupplierExists(values.supplierId),
    ]);

    if (poNumberError) {
      return poNumberError;
    }

    if (!manager) {
      return {
        errors: {
          managerId: ["Select an active manager or admin account."],
        },
        message: "Manager account could not be found.",
      };
    }

    if (!supplier) {
      return {
        errors: {
          supplierId: ["Select an active supplier profile."],
        },
        message: "Supplier profile could not be found.",
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

    await prisma.$transaction(
      async (tx) => {
        const restockOrder = await tx.restockOrder.create({
          data: {
            poNumber: values.poNumber,
            managerId: sessionUser.id,
            supplierId: values.supplierId,
            status: "PENDING",
            orderDate: values.orderDate,
            expectedDeliveryDate: values.expectedDeliveryDate,
            notes: values.notes,
          },
          select: {
            id: true,
          },
        });

        await tx.restockOrderItem.createMany({
          data: values.items.map((item) => ({
            restockOrderId: restockOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice,
          })),
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "CREATE",
            module: "RESTOCK_ORDERS",
            description: `Created restock order ${values.poNumber} for ${supplier.companyName} with ${values.items.length} product line${values.items.length === 1 ? "" : "s"}.`,
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateRestockRoutes();

    return {
      success: true,
      message: "Restock order created successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only managers and admins can create restock orders.",
      };
    }

    return validationErrorState(error);
  }
}

export async function confirmRestockOrder(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["SUPPLIER"]);

  try {
    const values = parseRestockDecisionFormData(formData);
    const restockOrder = await loadRestockOrderForDecision(values.id);

    if (!restockOrder) {
      return {
        message: "Restock order not found.",
      };
    }

    if (restockOrder.status !== "PENDING") {
      return {
        message: "Only pending restock orders can be confirmed.",
      };
    }

    if (
      sessionUser.id !== restockOrder.supplier.user.id ||
      restockOrder.supplier.user.status !== "ACTIVE"
    ) {
      return {
        message: "Only the assigned active supplier can confirm this order.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.restockOrder.update({
          where: { id: restockOrder.id },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
            notes: appendNote(restockOrder.notes, "Supplier confirmation", values.notes),
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "UPDATE",
            module: "RESTOCK_ORDERS",
            description: describeRestockAction(
              "Confirmed",
              restockOrder.poNumber,
              restockOrder.supplier.user.name
            ),
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateRestockRoutes();

    return {
      success: true,
      message: "Restock order confirmed by the supplier.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only the assigned supplier can confirm this order.",
      };
    }

    return validationErrorState(error);
  }
}

export async function rejectRestockOrder(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["SUPPLIER"]);

  try {
    const values = parseRestockDecisionFormData(formData);
    const restockOrder = await loadRestockOrderForDecision(values.id);

    if (!restockOrder) {
      return {
        message: "Restock order not found.",
      };
    }

    if (restockOrder.status !== "PENDING") {
      return {
        message: "Only pending restock orders can be rejected.",
      };
    }

    if (
      sessionUser.id !== restockOrder.supplier.user.id ||
      restockOrder.supplier.user.status !== "ACTIVE"
    ) {
      return {
        message: "Only the assigned active supplier can reject this order.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.restockOrder.update({
          where: { id: restockOrder.id },
          data: {
            status: "REJECTED",
            notes: appendNote(restockOrder.notes, "Supplier rejection", values.notes),
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "REJECT",
            module: "RESTOCK_ORDERS",
            description: describeRestockAction(
              "Rejected",
              restockOrder.poNumber,
              restockOrder.supplier.user.name
            ),
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateRestockRoutes();

    return {
      success: true,
      message: "Restock order rejected by the supplier.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only the assigned supplier can reject this order.",
      };
    }

    return validationErrorState(error);
  }
}

export async function markRestockOrderInTransit(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["SUPPLIER"]);

  try {
    const values = parseRestockDecisionFormData(formData);
    const restockOrder = await loadRestockOrderForDecision(values.id);

    if (!restockOrder) {
      return {
        message: "Restock order not found.",
      };
    }

    if (restockOrder.status !== "CONFIRMED") {
      return {
        message: "Only confirmed restock orders can move to in transit.",
      };
    }

    if (
      sessionUser.id !== restockOrder.supplier.user.id ||
      restockOrder.supplier.user.status !== "ACTIVE"
    ) {
      return {
        message: "Only the assigned active supplier can mark this order in transit.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.restockOrder.update({
          where: { id: restockOrder.id },
          data: {
            status: "IN_TRANSIT",
            notes: appendNote(restockOrder.notes, "Transit update", values.notes),
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "UPDATE",
            module: "RESTOCK_ORDERS",
            description: describeRestockAction(
              "Marked in transit",
              restockOrder.poNumber,
              restockOrder.supplier.user.name
            ),
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateRestockRoutes();

    return {
      success: true,
      message: "Restock order marked in transit.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only the assigned supplier can update this order to in transit.",
      };
    }

    return validationErrorState(error);
  }
}

export async function receiveRestockOrder(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["ADMIN", "MANAGER"]);

  try {
    const values = parseRestockDecisionFormData(formData);
    const restockOrder = await loadRestockOrderForDecision(values.id);

    if (!restockOrder) {
      return {
        message: "Restock order not found.",
      };
    }

    if (restockOrder.status !== "IN_TRANSIT") {
      return {
        message: "Only in-transit restock orders can be marked received.",
      };
    }

    const managerCanReceive =
      sessionUser.role === "ADMIN" ||
      (sessionUser.id === restockOrder.manager.id &&
        restockOrder.manager.status === "ACTIVE");

    if (!managerCanReceive) {
      return {
        message: "Only the assigned active manager can mark this order received.",
      };
    }

    if (restockOrder.sourceTransaction) {
      return {
        message: "This restock order already has a linked incoming transaction.",
      };
    }

    const receivedAt = new Date();
    const transactionNumber = await generateTransactionNumber();

    const receiveResult = await withSerializableRetry(() =>
      prisma.$transaction(
        async (tx) => {
        await lockRestockOrderForUpdate(tx, values.id);
        const itemProductIds = await tx.restockOrderItem.findMany({
          where: { restockOrderId: values.id },
          select: { productId: true },
        });
        await lockProductsForUpdate(
          tx,
          itemProductIds.map((item) => item.productId)
        );

        const lockedOrder = await loadRestockOrderForDecision(values.id, tx);

        if (!lockedOrder || lockedOrder.status !== "IN_TRANSIT") {
          return {
            ok: false as const,
            state: { message: "Only in-transit restock orders can be marked received." },
          };
        }

        const lockedManagerCanReceive =
          sessionUser.role === "ADMIN" ||
          (sessionUser.id === lockedOrder.manager.id &&
            lockedOrder.manager.status === "ACTIVE");

        if (!lockedManagerCanReceive || lockedOrder.sourceTransaction) {
          return {
            ok: false as const,
            state: {
              message: lockedOrder.sourceTransaction
                ? "This restock order already has a linked incoming transaction."
                : "Only the assigned active manager can mark this order received.",
            },
          };
        }

        await tx.restockOrder.update({
          where: { id: lockedOrder.id },
          data: {
            status: "RECEIVED",
            receivedAt,
            notes: appendNote(lockedOrder.notes, "Receipt note", values.notes),
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            transactionNumber,
            createdById: lockedOrder.managerId,
            approvedById: sessionUser.id,
            sourceRestockOrderId: lockedOrder.id,
            type: "INCOMING",
            status: "COMPLETED",
            destination: `Restock receipt from ${lockedOrder.supplier.companyName}`,
            notes: `Auto-created from restock order ${lockedOrder.poNumber}.`,
            transactionDate: receivedAt,
            approvedAt: receivedAt,
          },
          select: {
            id: true,
          },
        });

        for (const item of lockedOrder.items) {
          const stockBefore = item.product.currentStock;
          const stockAfter = getStockAfterMovement({
            currentStock: stockBefore,
            quantity: item.quantity,
            type: "INCOMING",
          });

          const productUpdate = await tx.product.updateMany({
            where: {
              id: item.productId,
              currentStock: stockBefore,
            },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });

          if (productUpdate.count !== 1) {
            return {
              ok: false as const,
              state: {
                message: `${item.product.name} changed during receipt. Refresh and receive the order again.`,
              },
            };
          }

          await tx.transactionItem.create({
            data: {
              transactionId: transaction.id,
              productId: item.productId,
              quantity: item.quantity,
              stockBefore,
              stockAfter,
            },
          });
        }

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "UPDATE",
            module: "RESTOCK_ORDERS",
            description: describeRestockAction(
              "Marked received",
              lockedOrder.poNumber,
              sessionUser.name ?? lockedOrder.manager.name
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
      )
    );

    if (!receiveResult.ok) {
      return receiveResult.state;
    }

    revalidateRestockRoutes();

    return {
      success: true,
      message:
        "Restock order received, stock updated, and linked incoming transaction created.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only the assigned manager or an admin can receive this order.",
      };
    }

    return validationErrorState(error);
  }
}

export async function createSupplierRating(
  _state: MutationState,
  formData: FormData
): Promise<MutationState> {
  const sessionUser = await requireCurrentUser(["ADMIN", "MANAGER"]);

  try {
    const values = parseSupplierRatingFormData(formData);
    const restockOrder = await loadRestockOrderForDecision(values.restockOrderId);

    if (!restockOrder) {
      return {
        message: "Restock order not found.",
      };
    }

    if (restockOrder.status !== "RECEIVED") {
      return {
        message: "Supplier ratings can only be added after the order is received.",
      };
    }

    const managerCanRate =
      sessionUser.role === "ADMIN" ||
      (sessionUser.id === restockOrder.manager.id &&
        restockOrder.manager.status === "ACTIVE");

    if (!managerCanRate) {
      return {
        message: "Only the assigned active manager can rate this supplier.",
      };
    }

    if (restockOrder.supplierRating) {
      return {
        message: "This restock order already has a supplier rating.",
      };
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.supplierRating.create({
          data: {
            restockOrderId: restockOrder.id,
            managerId: sessionUser.id,
            supplierId: restockOrder.supplierId,
            rating: values.rating,
            feedback: values.feedback,
          },
        });

        await tx.activityLog.create({
          data: {
            userId: sessionUser.id,
            action: "CREATE",
            module: "SUPPLIER_RATINGS",
            description: `Rated supplier ${restockOrder.supplier.companyName} ${values.rating}/5 for restock order ${restockOrder.poNumber}.`,
            ipAddress: "127.0.0.1",
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    revalidateRestockRoutes();

    return {
      success: true,
      message: "Supplier rating saved successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return {
        message: "Only the assigned manager or an admin can rate this supplier.",
      };
    }

    return validationErrorState(error);
  }
}
