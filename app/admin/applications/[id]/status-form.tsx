"use client";

import { useActionState } from "react";
import { updateApplicationStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function UpdateStatusForm({
  applicationId,
  status,
  adminNote,
}: {
  applicationId: number;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminNote: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateApplicationStatus,
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          {state?.message ? (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          ) : null}

          <input type="hidden" name="applicationId" value={applicationId} />

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={status === "DRAFT" ? "SUBMITTED" : status}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {state?.errors?.status?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.status[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="adminNote">Admin note (optional)</Label>
            <textarea
              id="adminNote"
              name="adminNote"
              defaultValue={adminNote}
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            />
            {state?.errors?.adminNote?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.adminNote[0]}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update"}
          </Button>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}

