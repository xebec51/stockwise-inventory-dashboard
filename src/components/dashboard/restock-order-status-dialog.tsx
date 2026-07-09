"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCheck, CircleOff, ShieldAlert, Truck } from "lucide-react";

import {
  confirmRestockOrder,
  markRestockOrderInTransit,
  receiveRestockOrder,
  rejectRestockOrder,
} from "@/app/dashboard/restock-orders/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { initialMutationState } from "@/lib/actions";

type RestockOrderStatusDialogProps = {
  actorId: string;
  actorLabel: string;
  description: string;
  mode: "confirm" | "reject" | "in_transit" | "receive";
  orderId: string;
  poNumber: string;
};

export function RestockOrderStatusDialog({
  actorId,
  actorLabel,
  description,
  mode,
  orderId,
  poNumber,
}: RestockOrderStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const action =
    mode === "confirm"
      ? confirmRestockOrder
      : mode === "reject"
        ? rejectRestockOrder
        : mode === "in_transit"
          ? markRestockOrderInTransit
          : receiveRestockOrder;
  const [state, formAction] = useActionState(action, initialMutationState);

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  const isDestructive = mode === "reject";
  const title =
    mode === "confirm"
      ? "Confirm restock order"
      : mode === "reject"
        ? "Reject restock order"
        : mode === "in_transit"
          ? "Mark order in transit"
          : "Mark order received";

  const idleLabel =
    mode === "confirm"
      ? "Confirm"
      : mode === "reject"
        ? "Reject"
        : mode === "in_transit"
          ? "Set In Transit"
          : "Mark Received";

  const pendingLabel =
    mode === "confirm"
      ? "Confirming..."
      : mode === "reject"
        ? "Rejecting..."
        : mode === "in_transit"
          ? "Updating..."
          : "Receiving...";

  const Icon =
    mode === "confirm"
      ? CheckCheck
      : mode === "reject"
        ? CircleOff
        : mode === "in_transit"
          ? Truck
          : ShieldAlert;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isDestructive ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            />
          ) : (
            <Button variant="outline" size="sm" />
          )
        }
      >
        <Icon className="size-4" />
        {idleLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={orderId} />
          <input type="hidden" name="actorId" value={actorId} />

          <Alert variant={isDestructive ? "destructive" : "default"}>
            <Icon className="size-4" />
            <AlertTitle>{poNumber}</AlertTitle>
            <AlertDescription>
              Acting as <strong>{actorLabel}</strong>.
            </AlertDescription>
          </Alert>

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Workflow action blocked</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`restock-status-note-${mode}`}>Note (optional)</Label>
            <Textarea id={`restock-status-note-${mode}`} name="notes" />
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
              idleLabel={idleLabel}
              pendingLabel={pendingLabel}
              variant={isDestructive ? "destructive" : "default"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
