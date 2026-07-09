"use client";

import { useActionState, useEffect, useState } from "react";
import { Star } from "lucide-react";

import { createSupplierRating } from "@/app/dashboard/restock-orders/actions";
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

type SupplierRatingFormDialogProps = {
  managerId: string;
  managerLabel: string;
  poNumber: string;
  restockOrderId: string;
  supplierName: string;
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

export function SupplierRatingFormDialog({
  managerId,
  managerLabel,
  poNumber,
  restockOrderId,
  supplierName,
}: SupplierRatingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("5");
  const [state, formAction] = useActionState(
    createSupplierRating,
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
      setRating("5");
    }

    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Star className="size-4" />
        Rate Supplier
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate supplier</DialogTitle>
          <DialogDescription>
            Record delivery feedback for {supplierName} after restock order{" "}
            {poNumber} has been received.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="restockOrderId" value={restockOrderId} />
          <input type="hidden" name="managerId" value={managerId} />
          <input type="hidden" name="rating" value={rating} />

          <Alert>
            <Star className="size-4" />
            <AlertTitle>Acting manager</AlertTitle>
            <AlertDescription>{managerLabel}</AlertDescription>
          </Alert>

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to save rating</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="supplier-rating">Rating</Label>
            <Select value={rating} onValueChange={(value) => setRating(value ?? "5")}>
              <SelectTrigger
                id="supplier-rating"
                className="w-full"
                aria-invalid={Boolean(state.errors?.rating?.length)}
              >
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {["5", "4", "3", "2", "1"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option} / 5
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state.errors} name="rating" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-feedback">Feedback (optional)</Label>
            <Textarea id="supplier-feedback" name="feedback" />
            <FieldError errors={state.errors} name="feedback" />
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
              idleLabel="Save rating"
              pendingLabel="Saving..."
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
