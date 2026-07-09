"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  error?: string;
};

const errorMessages: Record<string, string> = {
  ACTIVE: "Your account is active and ready to sign in.",
  PENDING: "This account is still pending approval.",
  REJECTED: "This account has been rejected and cannot sign in.",
  INACTIVE: "This account is inactive.",
  CredentialsSignin: "The email or password you entered is incorrect.",
  default: "Unable to sign in with those credentials.",
};

export function LoginForm({ error }: LoginFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(error ? errorMessages[error] ?? errorMessages.default : "");

  function handleSubmit(formData: FormData) {
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result) {
        setMessage(errorMessages.default);
        return;
      }

      if (result.error) {
        setMessage(errorMessages[result.error] ?? errorMessages.default);
        return;
      }

      router.push(result.url ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {message ? (
        <Alert variant="destructive">
          <AlertTitle>Sign-in blocked</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          placeholder="admin@stockwise.demo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          placeholder="Password123!"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
