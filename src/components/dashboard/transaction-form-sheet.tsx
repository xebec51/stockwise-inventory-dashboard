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
import { useI18n } from "@/lib/i18n/use-i18n";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: string;
};

type TransactionFormSheetProps = {
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
  const { t } = useI18n();
  const selectId = useId();
  const quantityId = useId();
  const selectedProduct = products.find((product) => product.id === item.productId);

  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_10rem_auto]">
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
        <p className="text-xs text-muted-foreground">
          {selectedProduct
            ? t("dialogs.workflow.currentStock", { stock: selectedProduct.currentStock, unit: selectedProduct.unit })
            : t("dialogs.workflow.chooseProduct")}
        </p>
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
        <p className="text-xs text-muted-foreground">
          {type === "INCOMING"
            ? t("dialogs.workflow.incomingAdds")
            : t("dialogs.workflow.outgoingDeducts")}
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
          {t("dialogs.workflow.remove")}
        </Button>
      </div>
    </div>
  );
}

export function TransactionFormSheet({
  currentUser,
  products,
}: TransactionFormSheetProps) {
  const { t } = useI18n();
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
        {t("dialogs.workflow.createTransaction")}
      </SheetTrigger>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-4xl"
        side="right"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{t("dialogs.workflow.createTransaction")}</SheetTitle>
          <SheetDescription>
            {t("dialogs.workflow.createTransactionDescription")}
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="space-y-4 px-4 pb-4">
          <input type="hidden" name="type" value={typeValue} />
          <input type="hidden" name="createdById" value={currentUser.id} />
          <input type="hidden" name="items" value={serializedItems} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.workflow.unableCreateTransaction")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transaction-created-by">{t("dialogs.workflow.createdBy")}</Label>
              <Input
                id="transaction-created-by"
                value={`${currentUser.name} (${currentUser.role})`}
                readOnly
              />
              <FieldError errors={state.errors} name="createdById" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type">{t("dialogs.workflow.type")}</Label>
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
                  <SelectValue placeholder={t("dialogs.workflow.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypeOptions.map((typeOption) => (
                    <SelectItem key={typeOption} value={typeOption}>
                      {t(`statuses.transaction.${typeOption}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="type" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-date">{t("dialogs.workflow.transactionDate")}</Label>
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
              <Label htmlFor="transaction-destination">{t("dialogs.workflow.destination")}</Label>
              <Input id="transaction-destination" name="destination" />
              <FieldError errors={state.errors} name="destination" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="transaction-notes">{t("dialogs.workflow.notes")}</Label>
              <Textarea id="transaction-notes" name="notes" />
              <FieldError errors={state.errors} name="notes" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t("dialogs.workflow.transactionItems")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dialogs.workflow.transactionItemsDescription")}
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
              {t("common.cancel")}
            </Button>
            <FormSubmitButton
              idleLabel={t("dialogs.workflow.createTransaction")}
              pendingLabel={t("dialogs.creating")}
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
