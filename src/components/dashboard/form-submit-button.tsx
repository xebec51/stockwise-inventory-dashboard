"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

export function FormSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "default",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
