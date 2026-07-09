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
            Approve
          </>
        ) : (
          <>
            <XCircle className="size-4" />
            Reject
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve transaction" : "Reject transaction"}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? `Approve ${transaction.transactionNumber} to apply its ${transaction.type.toLowerCase()} stock movement.`
              : `Reject ${transaction.transactionNumber} to keep stock unchanged and preserve the audit trail.`}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={transaction.id} />
          <input type="hidden" name="approverId" value={currentUser.id} />

          <Alert variant={isApprove ? "default" : "destructive"}>
            <ShieldAlert className="size-4" />
            <AlertTitle>
              {isApprove ? "Stock update warning" : "Rejection keeps stock unchanged"}
            </AlertTitle>
            <AlertDescription>
              {isApprove
                ? "Approving this request recalculates stockBefore and stockAfter from current live inventory and updates product stock."
                : "Rejecting this request preserves the pending audit record without changing product stock."}
            </AlertDescription>
          </Alert>

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Review action blocked</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`transaction-approver-${mode}`}>Approver</Label>
            <Input
              id={`transaction-approver-${mode}`}
              value={`${currentUser.name} (${currentUser.role})`}
              readOnly
            />
            <FieldError errors={state.errors} name="approverId" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`transaction-review-note-${mode}`}>
              {isApprove ? "Approval Note (optional)" : "Rejection Note (optional)"}
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
              Cancel
            </Button>
            <FormSubmitButton
              idleLabel={isApprove ? "Approve transaction" : "Reject transaction"}
              pendingLabel={isApprove ? "Approving..." : "Rejecting..."}
              variant={isApprove ? "default" : "destructive"}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
