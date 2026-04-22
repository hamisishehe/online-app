"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetUserPassword, updateUserRole } from "@/app/actions/admin";
import { DEFAULT_RESET_PASSWORD } from "@/lib/auth/default-password";
import { Button } from "@/components/ui/button";

export function RoleForm({
  userId,
  role,
}: {
  userId: number;
  role: "APPLICANT" | "ADMIN";
}) {
  const router = useRouter();
  const [roleState, roleAction, rolePending] = useActionState(
    updateUserRole,
    undefined
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetUserPassword,
    undefined
  );

  useEffect(() => {
    if (roleState?.message === "Role updated.") router.refresh();
  }, [router, roleState?.message]);

  const message = resetState?.message ?? roleState?.message;
  const isSuccess =
    message === "Role updated." ||
    message === `Password reset. Default password is ${DEFAULT_RESET_PASSWORD}.`;

  return (
    <div className="grid justify-items-end gap-2">
      <form action={roleAction} className="flex items-center justify-end gap-2">
        <input type="hidden" name="userId" value={userId} />
        <select
          name="role"
          defaultValue={role}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="APPLICANT">Applicant</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Button type="submit" size="sm" variant="outline" disabled={rolePending}>
          {rolePending ? "Saving..." : "Save"}
        </Button>
      </form>

      <form action={resetAction} className="flex items-center justify-end">
        <input type="hidden" name="userId" value={userId} />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={resetPending}
          formNoValidate
          onClick={(event) => {
            const confirmed = window.confirm(
              `Reset this user's password to ${DEFAULT_RESET_PASSWORD}?`
            );
            if (!confirmed) event.preventDefault();
          }}
        >
          {resetPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      {message ? (
        <p
          className={
            isSuccess
              ? "max-w-64 text-right text-xs text-muted-foreground"
              : "max-w-64 text-right text-xs text-destructive"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
