"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
  type MutationState,
  initialMutationState,
} from "@/lib/actions";
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
import { FormSubmitButton } from "@/components/dashboard/form-submit-button";

type DeleteConfirmDialogProps = {
  action: (
    state: MutationState,
    formData: FormData
  ) => Promise<MutationState>;
  description: string;
  entityId: string;
  entityLabel: string;
  title: string;
};

export function DeleteConfirmDialog({
  action,
  description,
  entityId,
  entityLabel,
  title,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, initialMutationState);

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setOpen(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" className="text-destructive" />}
      >
        <Trash2 className="size-4" />
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={entityId} />

          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Delete confirmation</AlertTitle>
            <AlertDescription>
              This action will remove <strong>{entityLabel}</strong> from the
              current workspace. This cannot be undone.
            </AlertDescription>
          </Alert>

          {state.message ? (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>{state.success ? "Completed" : "Action blocked"}</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <FormSubmitButton
              idleLabel="Delete"
              pendingLabel="Deleting..."
              variant="destructive"
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
