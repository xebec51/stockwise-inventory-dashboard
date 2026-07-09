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
    mode === "create" ? "Create supplier" : `Edit ${supplier?.companyName ?? "supplier"}`;
  const description =
    mode === "create"
      ? "Create a supplier account and linked profile for restock coordination."
      : "Update the supplier account details, profile fields, and current status.";
  const submitLabels = useMemo(
    () =>
      mode === "create"
        ? { idle: "Create supplier", pending: "Creating..." }
        : { idle: "Save changes", pending: "Saving..." },
    [mode]
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
            Create Supplier
          </>
        ) : (
          <>
            <Pencil className="size-4" />
            Edit
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
              <AlertTitle>Unable to save supplier</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`supplier-name-${mode}`}>Account Name</Label>
              <Input
                id={`supplier-name-${mode}`}
                name="name"
                defaultValue={supplier?.name ?? ""}
                aria-invalid={Boolean(state.errors?.name?.length)}
              />
              <FieldError errors={state.errors} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-email-${mode}`}>Email</Label>
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
                {mode === "create" ? "Password" : "Password (optional)"}
              </Label>
              <Input
                id={`supplier-password-${mode}`}
                name="password"
                type="password"
                placeholder={
                  mode === "create"
                    ? "Set an initial supplier password"
                    : "Leave blank to keep the current password"
                }
                aria-invalid={Boolean(state.errors?.password?.length)}
              />
              <FieldError errors={state.errors} name="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-status-${mode}`}>Status</Label>
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
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {supplierStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={state.errors} name="status" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-company-name-${mode}`}>Company Name</Label>
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
                Contact Person
              </Label>
              <Input
                id={`supplier-contact-person-${mode}`}
                name="contactPerson"
                defaultValue={supplier?.contactPerson ?? ""}
              />
              <FieldError errors={state.errors} name="contactPerson" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-phone-${mode}`}>Phone</Label>
              <Input
                id={`supplier-phone-${mode}`}
                name="phone"
                defaultValue={supplier?.phone ?? ""}
              />
              <FieldError errors={state.errors} name="phone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-category-${mode}`}>Supplier Category</Label>
              <Input
                id={`supplier-category-${mode}`}
                name="supplierCategory"
                defaultValue={supplier?.supplierCategory ?? ""}
              />
              <FieldError errors={state.errors} name="supplierCategory" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-bank-account-${mode}`}>Bank Account</Label>
              <Input
                id={`supplier-bank-account-${mode}`}
                name="bankAccount"
                defaultValue={supplier?.bankAccount ?? ""}
              />
              <FieldError errors={state.errors} name="bankAccount" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`supplier-avatar-url-${mode}`}>Avatar URL</Label>
              <Input
                id={`supplier-avatar-url-${mode}`}
                name="avatarUrl"
                defaultValue={supplier?.avatarUrl ?? ""}
                placeholder="https://example.com/supplier-avatar.jpg"
                aria-invalid={Boolean(state.errors?.avatarUrl?.length)}
              />
              <FieldError errors={state.errors} name="avatarUrl" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`supplier-address-${mode}`}>Address</Label>
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
              Cancel
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
