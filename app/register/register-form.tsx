"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Register as an applicant.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          {state?.message ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
            {state?.errors?.fullName?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.fullName[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.email[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone number</Label>
            <Input id="phoneNumber" name="phoneNumber" autoComplete="tel" required />
            {state?.errors?.phoneNumber?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.phoneNumber[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required />
            {state?.errors?.password?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.password[0]}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Register"}
          </Button>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

