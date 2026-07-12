"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { changePassword } from "@/app/dashboard/profile/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormSubmitButton } from "@/components/dashboard/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type MutationState, initialMutationState } from "@/lib/actions";
import { useI18n } from "@/lib/i18n/use-i18n";

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

function PasswordField({
  id,
  name,
  label,
  invalid,
}: {
  id: string;
  name: string;
  label: string;
  invalid: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={invalid}
          className="pr-9"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    changePassword,
    initialMutationState
  );
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      const timeoutId = window.setTimeout(() => {
        setFormKey((key) => key + 1);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state.success]);

  return (
    <Card className="stockwise-panel">
      <CardHeader>
        <CardTitle>{t("profile.passwordTitle")}</CardTitle>
        <CardDescription>{t("profile.passwordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={formKey} action={formAction} className="space-y-4">
          {state.message ? (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>
                {state.success
                  ? t("dialogs.completed")
                  : t("profile.unableToChangePassword")}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <PasswordField
            id="profile-current-password"
            name="currentPassword"
            label={t("profile.currentPassword")}
            invalid={Boolean(state.errors?.currentPassword?.length)}
          />
          <FieldError errors={state.errors} name="currentPassword" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <PasswordField
                id="profile-new-password"
                name="newPassword"
                label={t("profile.newPassword")}
                invalid={Boolean(state.errors?.newPassword?.length)}
              />
              <FieldError errors={state.errors} name="newPassword" />
            </div>
            <div>
              <PasswordField
                id="profile-confirm-password"
                name="confirmPassword"
                label={t("profile.confirmPassword")}
                invalid={Boolean(state.errors?.confirmPassword?.length)}
              />
              <FieldError errors={state.errors} name="confirmPassword" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("profile.passwordHint")}
          </p>

          <div className="flex justify-end">
            <FormSubmitButton
              idleLabel={t("profile.changePassword")}
              pendingLabel={t("profile.changingPassword")}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
