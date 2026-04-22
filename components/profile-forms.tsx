"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForms({
  user,
}: {
  user: { fullName: string; email: string; phoneNumber: string };
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    undefined
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePassword,
    undefined
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="grid gap-4">
            {profileState?.message ? (
              <p className="text-sm text-muted-foreground">{profileState.message}</p>
            ) : null}
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user.email} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={user.fullName}
                required
              />
              {profileState?.errors?.fullName?.[0] ? (
                <p className="text-xs text-destructive">
                  {profileState.errors.fullName[0]}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={user.phoneNumber}
                required
              />
              {profileState?.errors?.phoneNumber?.[0] ? (
                <p className="text-xs text-destructive">
                  {profileState.errors.phoneNumber[0]}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="grid gap-4">
            {passwordState?.message ? (
              <p
                className={
                  passwordState.message === "Password changed."
                    ? "text-sm text-muted-foreground"
                    : "text-sm text-destructive"
                }
              >
                {passwordState.message}
              </p>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
              {passwordState?.errors?.currentPassword?.[0] ? (
                <p className="text-xs text-destructive">
                  {passwordState.errors.currentPassword[0]}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
              />
              {passwordState?.errors?.newPassword?.[0] ? (
                <p className="text-xs text-destructive">
                  {passwordState.errors.newPassword[0]}
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? "Updating..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

