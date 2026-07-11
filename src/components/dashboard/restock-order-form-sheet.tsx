"use client";

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Minus, Plus } from "lucide-react";

import { createRestockOrder } from "@/app/dashboard/restock-orders/actions";
import { FormSubmitButton } from "@/components/dashboard/form-submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type MutationState, initialMutationState } from "@/lib/actions";
import type { AuthSessionUser } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/use-i18n";

type SupplierOption = {
  id: string;
  companyName: string;
  contactName: string;
};

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  unit: string;
};

type RestockItemDraft = {
  id: string;
  productId: string;
  quantity: string;
  estimatedPrice: string;
};

type RestockOrderFormSheetProps = {
  currentUser: AuthSessionUser;
  products: ProductOption[];
  suppliers: SupplierOption[];
};

function FieldError({
  errors,
  name,
}: {
  errors: MutationState["errors"];
  name: string;
}) {
  const message = errors?.[name]?.[0];

  if (!message) {
    return null;
  }

  return <p className="text-xs text-destructive">{message}</p>;
}

function createEmptyLine() {
  return {
    id: crypto.randomUUID(),
    productId: "",
    quantity: "1",
    estimatedPrice: "",
  };
}

function RestockItemRow({
  item,
  index,
  products,
  canRemove,
  setItems,
}: {
  item: RestockItemDraft;
  index: number;
  products: ProductOption[];
  canRemove: boolean;
  setItems: Dispatch<SetStateAction<RestockItemDraft[]>>;
}) {
  const { t } = useI18n();
  const selectId = useId();
  const quantityId = useId();
  const priceId = useId();

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_9rem_10rem_auto]">
      <div className="space-y-2">
        <Label htmlFor={selectId}>{t("dialogs.workflow.productNumber", { number: index + 1 })}</Label>
        <Select
          value={item.productId}
          onValueChange={(value) =>
            setItems((currentItems) =>
              currentItems.map((currentItem) =>
                currentItem.id === item.id
                  ? {
                      ...currentItem,
                      productId: value ?? "",
                    }
                  : currentItem
              )
            )
          }
        >
          <SelectTrigger id={selectId} className="w-full">
            <SelectValue placeholder={t("dialogs.workflow.selectProduct")} />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={quantityId}>{t("dialogs.workflow.quantity")}</Label>
        <Input
          id={quantityId}
          type="number"
          min="1"
          step="1"
          value={item.quantity}
          onChange={(event) =>
            setItems((currentItems) =>
              currentItems.map((currentItem) =>
                currentItem.id === item.id
                  ? {
                      ...currentItem,
                      quantity: event.target.value,
                    }
                  : currentItem
              )
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={priceId}>{t("dialogs.workflow.estimatedPrice")}</Label>
        <Input
          id={priceId}
          type="number"
          min="0"
          step="0.01"
          value={item.estimatedPrice}
          onChange={(event) =>
            setItems((currentItems) =>
              currentItems.map((currentItem) =>
                currentItem.id === item.id
                  ? {
                      ...currentItem,
                      estimatedPrice: event.target.value,
                    }
                  : currentItem
              )
            )
          }
        />
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canRemove}
          onClick={() =>
            setItems((currentItems) =>
              currentItems.filter((currentItem) => currentItem.id !== item.id)
            )
          }
        >
          <Minus className="size-4" />
          {t("dialogs.workflow.remove")}
        </Button>
      </div>
    </div>
  );
}

export function RestockOrderFormSheet({
  currentUser,
  products,
  suppliers,
}: RestockOrderFormSheetProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [items, setItems] = useState<RestockItemDraft[]>([createEmptyLine()]);
  const [state, formAction] = useActionState(
    createRestockOrder,
    initialMutationState
  );

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setSupplierId(suppliers[0]?.id ?? "");
      setItems([createEmptyLine()]);
    }

    setOpen(nextOpen);
  }

  const serializedItems = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
        }))
      ),
    [items]
  );

  const defaultOrderDate = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        {t("dialogs.workflow.createRestockOrder")}
      </SheetTrigger>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-4xl"
        side="right"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{t("dialogs.workflow.createRestockOrder")}</SheetTitle>
          <SheetDescription>
            {t("dialogs.workflow.createRestockDescription")}
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="space-y-4 px-4 pb-4">
          <input type="hidden" name="managerId" value={currentUser.id} />
          <input type="hidden" name="supplierId" value={supplierId} />
          <input type="hidden" name="items" value={serializedItems} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.workflow.unableCreateRestock")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="restock-manager">{t("dialogs.workflow.manager")}</Label>
              <Input
                id="restock-manager"
                value={`${currentUser.name} (${currentUser.role})`}
                readOnly
              />
              <FieldError errors={state.errors} name="managerId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-supplier">{t("dialogs.workflow.supplier")}</Label>
              <Select
                value={supplierId}
                onValueChange={(value) => setSupplierId(value ?? "")}
              >
                <SelectTrigger
                  id="restock-supplier"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.supplierId?.length)}
                >
                  <SelectValue placeholder={t("dialogs.workflow.selectSupplier")} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.companyName} ({supplier.contactName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="supplierId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-po-number">{t("dialogs.workflow.poNumber")}</Label>
              <Input
                id="restock-po-number"
                name="poNumber"
                placeholder="PO-2026-0101"
                aria-invalid={Boolean(state.errors?.poNumber?.length)}
              />
              <FieldError errors={state.errors} name="poNumber" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-order-date">{t("dialogs.workflow.orderDate")}</Label>
              <Input
                id="restock-order-date"
                name="orderDate"
                type="date"
                defaultValue={defaultOrderDate}
                aria-invalid={Boolean(state.errors?.orderDate?.length)}
              />
              <FieldError errors={state.errors} name="orderDate" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restock-expected-date">{t("dialogs.workflow.expectedDeliveryDate")}</Label>
              <Input
                id="restock-expected-date"
                name="expectedDeliveryDate"
                type="date"
                aria-invalid={Boolean(state.errors?.expectedDeliveryDate?.length)}
              />
              <FieldError errors={state.errors} name="expectedDeliveryDate" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restock-notes">{t("dialogs.workflow.notes")}</Label>
              <Textarea id="restock-notes" name="notes" />
              <FieldError errors={state.errors} name="notes" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t("dialogs.workflow.orderItems")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.workflow.orderItemsDescription")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((currentItems) => [...currentItems, createEmptyLine()])}
              >
                <Plus className="size-4" />
                {t("dialogs.workflow.addLine")}
              </Button>
            </div>

            <FieldError errors={state.errors} name="items" />

            <div className="space-y-3">
              {items.map((item, index) => (
                <RestockItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  products={products}
                  canRemove={items.length > 1}
                  setItems={setItems}
                />
              ))}
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 border-t border-border bg-background px-0 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <FormSubmitButton
              idleLabel={t("dialogs.workflow.createRestockOrder")}
              pendingLabel={t("dialogs.creating")}
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
