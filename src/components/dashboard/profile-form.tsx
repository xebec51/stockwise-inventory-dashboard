"use client";

import { useActionState, useState } from "react";

import { updateProfile } from "@/app/dashboard/profile/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    phone: string | null;
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

export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    updateProfile,
    initialMutationState
  );
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? "");
  const [namePreview, setNamePreview] = useState(user.name);

  return (
    <Card className="stockwise-panel">
      <CardHeader>
        <CardTitle>{t("profile.editTitle")}</CardTitle>
        <CardDescription>{t("profile.editDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertTitle>
                {state.success
                  ? t("dialogs.completed")
                  : t("profile.unableToSaveProfile")}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={avatarPreview || undefined} alt={namePreview} />
              <AvatarFallback>
                {namePreview.slice(0, 2).toUpperCase() || "SW"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="profile-avatar-url">
                {t("dialogs.field.avatarUrl")}
              </Label>
              <Input
                id="profile-avatar-url"
                name="avatarUrl"
                defaultValue={user.avatarUrl ?? ""}
                placeholder={t("dialogs.placeholder.supplierAvatar")}
                aria-invalid={Boolean(state.errors?.avatarUrl?.length)}
                onChange={(event) => setAvatarPreview(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("profile.avatarUrlHint")}
              </p>
              <FieldError errors={state.errors} name="avatarUrl" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t("dialogs.field.name")}</Label>
              <Input
                id="profile-name"
                name="name"
                defaultValue={user.name}
                aria-invalid={Boolean(state.errors?.name?.length)}
                onChange={(event) => setNamePreview(event.target.value)}
                required
              />
              <FieldError errors={state.errors} name="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">{t("profile.emailLabel")}</Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                defaultValue={user.email}
                aria-invalid={Boolean(state.errors?.email?.length)}
                required
              />
              <FieldError errors={state.errors} name="email" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="profile-phone">{t("profile.phoneLabel")}</Label>
              <Input
                id="profile-phone"
                name="phone"
                defaultValue={user.phone ?? ""}
                aria-invalid={Boolean(state.errors?.phone?.length)}
              />
              <FieldError errors={state.errors} name="phone" />
            </div>
          </div>

          <div className="flex justify-end">
            <FormSubmitButton
              idleLabel={t("profile.saveChanges")}
              pendingLabel={t("profile.savingChanges")}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
