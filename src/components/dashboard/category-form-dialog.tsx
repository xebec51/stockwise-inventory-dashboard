"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";

import {
  createCategory,
  updateCategory,
} from "@/app/dashboard/categories/actions";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSubmitButton } from "@/components/dashboard/form-submit-button";

type CategoryDialogMode = "create" | "edit";

type CategoryFormDialogProps = {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
  };
  mode: CategoryDialogMode;
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

export function CategoryFormDialog({
  category,
  mode,
}: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createCategory : updateCategory;
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
    mode === "create" ? "Create category" : `Edit ${category?.name ?? "category"}`;
  const description =
    mode === "create"
      ? "Add a new category to organize inventory and product groupings."
      : "Update the category details shown throughout the product catalog.";
  const submitLabels = useMemo(
    () =>
      mode === "create"
        ? { idle: "Create category", pending: "Creating..." }
        : { idle: "Save changes", pending: "Saving..." },
    [mode]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Create Category
          </>
        ) : (
          <>
            <Pencil className="size-4" />
            Edit
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {category ? <input type="hidden" name="id" value={category.id} /> : null}

          {state.message && !state.success ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to save category</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`category-name-${mode}`}>Name</Label>
            <Input
              id={`category-name-${mode}`}
              name="name"
              defaultValue={category?.name ?? ""}
              aria-invalid={Boolean(state.errors?.name?.length)}
            />
            <FieldError errors={state.errors} name="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-slug-${mode}`}>Slug</Label>
            <Input
              id={`category-slug-${mode}`}
              name="slug"
              defaultValue={category?.slug ?? ""}
              aria-invalid={Boolean(state.errors?.slug?.length)}
            />
            <FieldError errors={state.errors} name="slug" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-description-${mode}`}>Description</Label>
            <Textarea
              id={`category-description-${mode}`}
              name="description"
              defaultValue={category?.description ?? ""}
            />
            <FieldError errors={state.errors} name="description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-image-url-${mode}`}>Image URL</Label>
            <Input
              id={`category-image-url-${mode}`}
              name="imageUrl"
              defaultValue={category?.imageUrl ?? ""}
              placeholder="https://example.com/category-image.jpg"
              aria-invalid={Boolean(state.errors?.imageUrl?.length)}
            />
            <FieldError errors={state.errors} name="imageUrl" />
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
