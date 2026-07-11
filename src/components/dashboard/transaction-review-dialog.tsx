"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

import {
  approveTransaction,
  rejectTransaction,
} from "@/app/dashboard/transactions/actions";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type MutationState, initialMutationState } from "@/lib/actions";
import type { AuthSessionUser } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/use-i18n";

type TransactionReviewDialogProps = {
  currentUser: AuthSessionUser;
  mode: "approve" | "reject";
  transaction: {
    id: string;
    transactionNumber: string;
    type: string;
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

export function TransactionReviewDialog({
  currentUser,
  mode,
  transaction,
}: TransactionReviewDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const action = mode === "approve" ? approveTransaction : rejectTransaction;
  const [state, formAction] = useActionState(action, initialMutationState);

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }

  const isApprove = mode === "approve";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isApprove ? (
            <Button variant="outline" size="sm" />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            />
          )
        }
      >
        {isApprove ? (
          <>
            <CheckCircle2 className="size-4" />
            {t("dialogs.workflow.approve")}
          </>
        ) : (
          <>
            <XCircle className="size-4" />
            {t("dialogs.workflow.reject")}
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? t("dialogs.workflow.approveTitle") : t("dialogs.workflow.rejectTitle")}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? t("dialogs.workflow.approveDescription", { number: transaction.transactionNumber, type: transaction.type.toLowerCase() })
              : t("dialogs.workflow.rejectDescription", { number: transaction.transactionNumber })}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          <input type="hidden" name="approverId" value={currentUser.id} />

          <Alert variant={isApprove ? "default" : "destructive"}>
            <ShieldAlert className="size-4" />
            <AlertTitle>
              {isApprove ? t("dialogs.workflow.stockUpdateWarning") : t("dialogs.workflow.rejectionNoStock")}
            </AlertTitle>
            <AlertDescription>
              {isApprove
                ? t("dialogs.workflow.approvalWarning")
                : t("dialogs.workflow.rejectionWarning")}
            </AlertDescription>
          </Alert>

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>{t("dialogs.workflow.reviewBlocked")}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`transaction-approver-${mode}`}>{t("dialogs.workflow.approver")}</Label>
            <Input
              id={`transaction-approver-${mode}`}
              value={`${currentUser.name} (${currentUser.role})`}
              readOnly
            />
            <FieldError errors={state.errors} name="approverId" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`transaction-review-note-${mode}`}>
              {isApprove ? t("dialogs.workflow.approvalNote") : t("dialogs.workflow.rejectionNote")}
            </Label>
            <Textarea id={`transaction-review-note-${mode}`} name="notes" />
            <FieldError errors={state.errors} name="notes" />
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
              idleLabel={isApprove ? t("dialogs.workflow.approveTitle") : t("dialogs.workflow.rejectTitle")}
              pendingLabel={isApprove ? t("dialogs.workflow.approving") : t("dialogs.workflow.rejecting")}
              variant={isApprove ? "default" : "destructive"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
