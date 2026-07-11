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
import { useI18n } from "@/lib/i18n/use-i18n";

type RestockOrderStatusDialogProps = {
  actorId: string;
  actorLabel: string;
  mode: "confirm" | "reject" | "in_transit" | "receive";
  orderId: string;
  poNumber: string;
};

export function RestockOrderStatusDialog({
  actorId,
  actorLabel,
  mode,
  orderId,
  poNumber,
}: RestockOrderStatusDialogProps) {
  const { t } = useI18n();
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
      ? t("dialogs.workflow.confirmOrder")
      : mode === "reject"
        ? t("dialogs.workflow.rejectOrder")
        : mode === "in_transit"
          ? t("dialogs.workflow.markInTransit")
          : t("dialogs.workflow.markReceived");

  const idleLabel =
    mode === "confirm"
      ? t("dialogs.workflow.confirm")
      : mode === "reject"
        ? t("dialogs.workflow.reject")
        : mode === "in_transit"
          ? t("dialogs.workflow.setInTransit")
          : t("dialogs.workflow.markReceived");

  const description =
    mode === "confirm"
      ? t("dialogs.workflow.confirmOrderDescription")
      : mode === "reject"
        ? t("dialogs.workflow.rejectOrderDescription")
        : mode === "in_transit"
          ? t("dialogs.workflow.markInTransitDescription")
          : t("dialogs.workflow.markReceivedDescription");

  const pendingLabel =
    mode === "confirm"
      ? t("dialogs.workflow.confirming")
      : mode === "reject"
        ? t("dialogs.workflow.rejecting")
        : mode === "in_transit"
          ? t("dialogs.workflow.updating")
          : t("dialogs.workflow.receiving");

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
              {t("dialogs.workflow.actingAs", { actor: actorLabel })}
            </AlertDescription>
          </Alert>

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.workflow.workflowBlocked")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`restock-status-note-${mode}`}>{t("dialogs.workflow.optionalNote")}</Label>
            <Textarea id={`restock-status-note-${mode}`} name="notes" />
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
