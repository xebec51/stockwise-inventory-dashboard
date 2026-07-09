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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type ManagerOption = {
  id: string;
  name: string;
  role: string;
};

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

type RestockOrderFormDialogProps = {
  managers: ManagerOption[];
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
  const selectId = useId();
  const quantityId = useId();
  const priceId = useId();

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_9rem_10rem_auto]">
      <div className="space-y-2">
        <Label htmlFor={selectId}>Product {index + 1}</Label>
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
            <SelectValue placeholder="Select product" />
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
        <Label htmlFor={quantityId}>Quantity</Label>
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
        <Label htmlFor={priceId}>Est. Price</Label>
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
          Remove
        </Button>
      </div>
    </div>
  );
}

export function RestockOrderFormDialog({
  managers,
  products,
  suppliers,
}: RestockOrderFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [managerId, setManagerId] = useState(managers[0]?.id ?? "");
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
      setManagerId(managers[0]?.id ?? "");
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        Create Restock Order
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create restock order</DialogTitle>
          <DialogDescription>
            Create a pending purchase order for a supplier with multiple product
            lines and estimated pricing.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="managerId" value={managerId} />
          <input type="hidden" name="supplierId" value={supplierId} />
          <input type="hidden" name="items" value={serializedItems} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to create restock order</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="restock-manager">Manager</Label>
              <Select
                value={managerId}
                onValueChange={(value) => setManagerId(value ?? "")}
              >
                <SelectTrigger
                  id="restock-manager"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.managerId?.length)}
                >
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="managerId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-supplier">Supplier</Label>
              <Select
                value={supplierId}
                onValueChange={(value) => setSupplierId(value ?? "")}
              >
                <SelectTrigger
                  id="restock-supplier"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.supplierId?.length)}
                >
                  <SelectValue placeholder="Select supplier" />
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
              <Label htmlFor="restock-po-number">PO Number</Label>
              <Input
                id="restock-po-number"
                name="poNumber"
                placeholder="PO-2026-0101"
                aria-invalid={Boolean(state.errors?.poNumber?.length)}
              />
              <FieldError errors={state.errors} name="poNumber" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-order-date">Order Date</Label>
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
              <Label htmlFor="restock-expected-date">Expected Delivery Date</Label>
              <Input
                id="restock-expected-date"
                name="expectedDeliveryDate"
                type="date"
                aria-invalid={Boolean(state.errors?.expectedDeliveryDate?.length)}
              />
              <FieldError errors={state.errors} name="expectedDeliveryDate" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restock-notes">Notes</Label>
              <Textarea id="restock-notes" name="notes" />
              <FieldError errors={state.errors} name="notes" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Order items</h3>
                <p className="text-sm text-muted-foreground">
                  Build the replenishment basket before the supplier confirms it.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems((currentItems) => [...currentItems, createEmptyLine()])}
              >
                <Plus className="size-4" />
                Add Line
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <FormSubmitButton
              idleLabel="Create restock order"
              pendingLabel="Creating..."
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
