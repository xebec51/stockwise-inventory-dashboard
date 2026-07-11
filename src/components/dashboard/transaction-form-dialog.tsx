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

import { createTransaction } from "@/app/dashboard/transactions/actions";
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

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
};

type TransactionFormDialogProps = {
  currentUser: AuthSessionUser;
  products: ProductOption[];
};

type TransactionLineDraft = {
  id: string;
  productId: string;
  quantity: string;
};

const transactionTypeOptions = ["INCOMING", "OUTGOING"] as const;

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
  };
}

function TransactionItemRow({
  item,
  index,
  products,
  type,
  canRemove,
  setItems,
}: {
  item: TransactionLineDraft;
  index: number;
  products: ProductOption[];
  type: (typeof transactionTypeOptions)[number];
  canRemove: boolean;
  setItems: Dispatch<SetStateAction<TransactionLineDraft[]>>;
}) {
  const selectId = useId();
  const quantityId = useId();
  const selectedProduct = products.find((product) => product.id === item.productId);

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_10rem_auto]">
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
        <p className="text-xs text-muted-foreground">
          {selectedProduct
            ? `Current stock: ${selectedProduct.currentStock} ${selectedProduct.unit}`
            : "Choose a product to set the quantity line."}
        </p>
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
        <p className="text-xs text-muted-foreground">
          {type === "INCOMING"
            ? "Approved incoming lines add stock."
            : "Approved outgoing lines deduct stock."}
        </p>
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

export function TransactionFormDialog({
  currentUser,
  products,
}: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [typeValue, setTypeValue] =
    useState<(typeof transactionTypeOptions)[number]>("INCOMING");
  const [items, setItems] = useState<TransactionLineDraft[]>([createEmptyLine()]);
  const [state, formAction] = useActionState(createTransaction, initialMutationState);

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
      setTypeValue("INCOMING");
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
        }))
      ),
    [items]
  );

  const defaultTransactionDate = useMemo(() => {
    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60_000;

    return new Date(now.getTime() - localOffset).toISOString().slice(0, 16);
  }, []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        Create Transaction
      </SheetTrigger>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-4xl"
        side="right"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Create transaction</SheetTitle>
          <SheetDescription>
            Record a pending incoming or outgoing stock movement with multiple
            product lines for manager review.
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="space-y-4 px-4 pb-4">
          <input type="hidden" name="type" value={typeValue} />
          <input type="hidden" name="createdById" value={currentUser.id} />
          <input type="hidden" name="items" value={serializedItems} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to create transaction</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-created-by">Created By</Label>
              <Input
                id="transaction-created-by"
                value={`${currentUser.name} (${currentUser.role})`}
                readOnly
              />
              <FieldError errors={state.errors} name="createdById" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type">Type</Label>
              <Select
                value={typeValue}
                onValueChange={(value) =>
                  setTypeValue(
                    (value as (typeof transactionTypeOptions)[number]) ?? "INCOMING"
                  )
                }
              >
                <SelectTrigger
                  id="transaction-type"
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.type?.length)}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypeOptions.map((typeOption) => (
                    <SelectItem key={typeOption} value={typeOption}>
                      {typeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="type" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-date">Transaction Date</Label>
              <Input
                id="transaction-date"
                name="transactionDate"
                type="datetime-local"
                defaultValue={defaultTransactionDate}
                aria-invalid={Boolean(state.errors?.transactionDate?.length)}
              />
              <FieldError errors={state.errors} name="transactionDate" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-destination">Destination</Label>
              <Input id="transaction-destination" name="destination" />
              <FieldError errors={state.errors} name="destination" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="transaction-notes">Notes</Label>
              <Textarea id="transaction-notes" name="notes" />
              <FieldError errors={state.errors} name="notes" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Transaction items</h3>
                <p className="text-sm text-muted-foreground">
                  Pending transactions do not change stock until they are approved.
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
                <TransactionItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  products={products}
                  type={typeValue}
                  canRemove={items.length > 1}
                  setItems={setItems}
                />
              ))}
            </div>
          </div>

          <SheetFooter className="border-t border-border/70 px-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <FormSubmitButton
              idleLabel="Create transaction"
              pendingLabel="Creating..."
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
