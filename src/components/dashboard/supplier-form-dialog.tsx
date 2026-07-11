"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import {
  createSupplier,
  updateSupplier,
} from "@/app/dashboard/suppliers/actions";
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
import { useI18n } from "@/lib/i18n/use-i18n";
import { translateUserStatus } from "@/lib/i18n/status";
import { supplierStatusOptions } from "@/lib/validations/supplier";

type SupplierDialogMode = "create" | "edit";

type SupplierFormDialogProps = {
  mode: SupplierDialogMode;
  supplier?: {
    id: string;
    name: string;
    email: string;
    status: (typeof supplierStatusOptions)[number];
    companyName: string;
    contactPerson: string | null;
    phone: string | null;
    supplierCategory: string | null;
    bankAccount: string | null;
    address: string | null;
    avatarUrl: string | null;
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

export function SupplierFormDialog({
  mode,
  supplier,
}: SupplierFormDialogProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<
    (typeof supplierStatusOptions)[number]
  >(supplier?.status ?? "ACTIVE");
  const action = mode === "create" ? createSupplier : updateSupplier;
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
      ? t("dialogs.createSupplierTitle")
      : `${t("common.edit")} ${supplier?.companyName ?? t("nav.suppliers").toLowerCase()}`;
  const description =
    mode === "create"
      ? t("dialogs.createSupplierDescription")
      : t("dialogs.editSupplierDescription");
  const submitLabels = useMemo(
    () =>
      mode === "create"
        ? { idle: t("dialogs.createSupplier"), pending: t("dialogs.creating") }
        : { idle: t("common.save"), pending: t("dialogs.saving") },
    [mode, t]
  );

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setStatusValue(supplier?.status ?? "ACTIVE");
    }

    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
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
            {t("dialogs.createSupplier")}
          </>
        ) : (
          <>
            <Pencil className="size-4" />
            {t("dialogs.edit")}
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {supplier ? <input type="hidden" name="id" value={supplier.id} /> : null}
          <input type="hidden" name="status" value={statusValue} />

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.unableToSaveSupplier")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`supplier-name-${mode}`}>{t("dialogs.field.accountName")}</Label>
              <Input
                id={`supplier-name-${mode}`}
                name="name"
                defaultValue={supplier?.name ?? ""}
                aria-invalid={Boolean(state.errors?.name?.length)}
              />
              <FieldError errors={state.errors} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-email-${mode}`}>{t("dialogs.field.email")}</Label>
              <Input
                id={`supplier-email-${mode}`}
                name="email"
                type="email"
                defaultValue={supplier?.email ?? ""}
                aria-invalid={Boolean(state.errors?.email?.length)}
              />
              <FieldError errors={state.errors} name="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-password-${mode}`}>
                {mode === "create" ? t("dialogs.field.password") : t("dialogs.field.passwordOptional")}
              </Label>
              <Input
                id={`supplier-password-${mode}`}
                name="password"
                type="password"
                placeholder={
                  mode === "create"
                    ? t("dialogs.placeholder.supplierPassword")
                    : t("dialogs.placeholder.supplierPasswordKeep")
                }
                aria-invalid={Boolean(state.errors?.password?.length)}
              />
              <FieldError errors={state.errors} name="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-status-${mode}`}>{t("dialogs.field.status")}</Label>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  setStatusValue(
                    (value as (typeof supplierStatusOptions)[number]) ?? "ACTIVE"
                  )
                }
              >
                <SelectTrigger
                  id={`supplier-status-${mode}`}
                  className="w-full"
                  aria-invalid={Boolean(state.errors?.status?.length)}
                >
                  <SelectValue placeholder={t("dialogs.placeholder.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {supplierStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {translateUserStatus(status, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="status" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-company-name-${mode}`}>{t("dialogs.field.companyName")}</Label>
              <Input
                id={`supplier-company-name-${mode}`}
                name="companyName"
                defaultValue={supplier?.companyName ?? ""}
                aria-invalid={Boolean(state.errors?.companyName?.length)}
              />
              <FieldError errors={state.errors} name="companyName" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-contact-person-${mode}`}>
                {t("dialogs.field.contactPerson")}
              </Label>
              <Input
                id={`supplier-contact-person-${mode}`}
                name="contactPerson"
                defaultValue={supplier?.contactPerson ?? ""}
              />
              <FieldError errors={state.errors} name="contactPerson" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-phone-${mode}`}>{t("dialogs.field.phone")}</Label>
              <Input
                id={`supplier-phone-${mode}`}
                name="phone"
                defaultValue={supplier?.phone ?? ""}
              />
              <FieldError errors={state.errors} name="phone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-category-${mode}`}>{t("dialogs.field.supplierCategory")}</Label>
              <Input
                id={`supplier-category-${mode}`}
                name="supplierCategory"
                defaultValue={supplier?.supplierCategory ?? ""}
              />
              <FieldError errors={state.errors} name="supplierCategory" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-bank-account-${mode}`}>{t("dialogs.field.bankAccount")}</Label>
              <Input
                id={`supplier-bank-account-${mode}`}
                name="bankAccount"
                defaultValue={supplier?.bankAccount ?? ""}
              />
              <FieldError errors={state.errors} name="bankAccount" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-avatar-url-${mode}`}>{t("dialogs.field.avatarUrl")}</Label>
              <Input
                id={`supplier-avatar-url-${mode}`}
                name="avatarUrl"
                defaultValue={supplier?.avatarUrl ?? ""}
                placeholder={t("dialogs.placeholder.supplierAvatar")}
                aria-invalid={Boolean(state.errors?.avatarUrl?.length)}
              />
              <FieldError errors={state.errors} name="avatarUrl" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`supplier-address-${mode}`}>{t("dialogs.field.address")}</Label>
              <Textarea
                id={`supplier-address-${mode}`}
                name="address"
                defaultValue={supplier?.address ?? ""}
              />
              <FieldError errors={state.errors} name="address" />
            </div>
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
