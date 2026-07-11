"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/use-i18n";

type LoginFormProps = {
  error?: string;
};

export function LoginForm({ error }: LoginFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(
    error ? t(`login.errors.${error}`) : ""
  );

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  function handleSubmit(formData: FormData) {
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    setMessage("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result) {
        setMessage(t("login.errors.default"));
        return;
      }

      if (result.error) {
        setMessage(t(`login.errors.${result.error}`));
        return;
      }

      router.replace(result.url ?? "/dashboard");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4" aria-busy={pending}>
      {message ? (
        <Alert variant="destructive">
          <AlertTitle>{t("login.blockedTitle")}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">{t("login.email")}</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder={t("login.emailPlaceholder")}
          disabled={pending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">{t("login.password")}</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder={t("login.passwordPlaceholder")}
          disabled={pending}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("login.signingIn") : t("login.signIn")}
      </Button>
    </form>
  );
}
