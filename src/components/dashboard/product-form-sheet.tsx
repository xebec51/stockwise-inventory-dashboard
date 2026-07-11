"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import {
  createProduct,
  updateProduct,
} from "@/app/dashboard/products/actions";
import {
  type MutationState,
  initialMutationState,
} from "@/lib/actions";
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
import { FormSubmitButton } from "@/components/dashboard/form-submit-button";
import { useI18n } from "@/lib/i18n/use-i18n";

type ProductSheetMode = "create" | "edit";

type ProductFormSheetProps = {
  categories: Array<{
    id: string;
    name: string;
  }>;
  mode: ProductSheetMode;
  product?: {
    id: string;
    categoryId: string;
    name: string;
    sku: string;
    description: string | null;
    purchasePrice: string;
    sellingPrice: string;
    currentStock: number;
    minimumStock: number;
    unit: string;
    rackLocation: string | null;
    imageUrl: string | null;
    qrCode: string | null;
  };
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

export function ProductFormSheet({
  categories,
  mode,
  product,
}: ProductFormSheetProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(product?.categoryId ?? "");
  const action = mode === "create" ? createProduct : updateProduct;
  const [state, formAction] = useActionState(action, initialMutationState);

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  const title =
    mode === "create"
      ? t("dialogs.createProductTitle")
      : `${t("common.edit")} ${product?.name ?? t("nav.products").toLowerCase()}`;
  const description =
    mode === "create"
      ? t("dialogs.createProductDescription")
      : t("dialogs.editProductDescription");
  const submitLabels = useMemo(
    () =>
      mode === "create"
        ? { idle: t("dialogs.createProduct"), pending: t("dialogs.creating") }
        : { idle: t("common.save"), pending: t("dialogs.saving") },
    [mode, t]
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setCategoryValue(product?.categoryId ?? "");
    }

    setOpen(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          mode === "create" ? (
            <Button size="sm" />
          ) : (
            <Button variant="ghost" size="sm" />
          )
        }
      >
        {mode === "create" ? (
          <>
            <Plus className="size-4" />
            {t("dialogs.createProduct")}
          </>
        ) : (
          <>
            <Pencil className="size-4" />
            {t("dialogs.edit")}
          </>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-full overflow-y-auto sm:max-w-3xl"
        side="right"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="space-y-4 px-4 pb-4">
          {product ? <input type="hidden" name="id" value={product.id} /> : null}
          <input type="hidden" name="categoryId" value={categoryValue} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.unableToSaveProduct")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`product-category-${mode}`}>{t("dialogs.field.category")}</Label>
              <Select
                value={categoryValue}
                onValueChange={(value) => setCategoryValue(value ?? "")}
              >
                <SelectTrigger
                  id={`product-category-${mode}`}
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.categoryId?.length)}
                >
                  <SelectValue placeholder={t("dialogs.field.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="categoryId" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-name-${mode}`}>{t("dialogs.field.name")}</Label>
              <Input
                id={`product-name-${mode}`}
                name="name"
                defaultValue={product?.name ?? ""}
                aria-invalid={Boolean(state.errors?.name?.length)}
              />
              <FieldError errors={state.errors} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-sku-${mode}`}>{t("dialogs.field.sku")}</Label>
              <Input
                id={`product-sku-${mode}`}
                name="sku"
                defaultValue={product?.sku ?? ""}
                aria-invalid={Boolean(state.errors?.sku?.length)}
              />
              <FieldError errors={state.errors} name="sku" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-unit-${mode}`}>{t("dialogs.field.unit")}</Label>
              <Input
                id={`product-unit-${mode}`}
                name="unit"
                defaultValue={product?.unit ?? ""}
                aria-invalid={Boolean(state.errors?.unit?.length)}
              />
              <FieldError errors={state.errors} name="unit" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-purchase-price-${mode}`}>
                {t("dialogs.field.purchasePrice")}
              </Label>
              <Input
                id={`product-purchase-price-${mode}`}
                name="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.purchasePrice ?? "0"}
                aria-invalid={Boolean(state.errors?.purchasePrice?.length)}
              />
              <FieldError errors={state.errors} name="purchasePrice" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-selling-price-${mode}`}>
                {t("dialogs.field.sellingPrice")}
              </Label>
              <Input
                id={`product-selling-price-${mode}`}
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product?.sellingPrice ?? "0"}
                aria-invalid={Boolean(state.errors?.sellingPrice?.length)}
              />
              <FieldError errors={state.errors} name="sellingPrice" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-current-stock-${mode}`}>
                {t("dialogs.field.currentStock")}
              </Label>
              <Input
                id={`product-current-stock-${mode}`}
                name="currentStock"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.currentStock ?? 0}
                aria-invalid={Boolean(state.errors?.currentStock?.length)}
              />
              <FieldError errors={state.errors} name="currentStock" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-minimum-stock-${mode}`}>
                {t("dialogs.field.minimumStock")}
              </Label>
              <Input
                id={`product-minimum-stock-${mode}`}
                name="minimumStock"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.minimumStock ?? 0}
                aria-invalid={Boolean(state.errors?.minimumStock?.length)}
              />
              <FieldError errors={state.errors} name="minimumStock" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-rack-location-${mode}`}>{t("dialogs.field.rackLocation")}</Label>
              <Input
                id={`product-rack-location-${mode}`}
                name="rackLocation"
                defaultValue={product?.rackLocation ?? ""}
              />
              <FieldError errors={state.errors} name="rackLocation" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`product-qr-code-${mode}`}>{t("dialogs.field.qrCode")}</Label>
              <Input
                id={`product-qr-code-${mode}`}
                name="qrCode"
                defaultValue={product?.qrCode ?? ""}
                aria-invalid={Boolean(state.errors?.qrCode?.length)}
              />
              <FieldError errors={state.errors} name="qrCode" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`product-image-url-${mode}`}>{t("dialogs.field.imageUrl")}</Label>
              <Input
                id={`product-image-url-${mode}`}
                name="imageUrl"
                defaultValue={product?.imageUrl ?? ""}
                placeholder={t("dialogs.placeholder.productImage")}
                aria-invalid={Boolean(state.errors?.imageUrl?.length)}
              />
              <FieldError errors={state.errors} name="imageUrl" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`product-description-${mode}`}>{t("dialogs.field.description")}</Label>
              <Textarea
                id={`product-description-${mode}`}
                name="description"
                defaultValue={product?.description ?? ""}
              />
              <FieldError errors={state.errors} name="description" />
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
              idleLabel={submitLabels.idle}
              pendingLabel={submitLabels.pending}
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
