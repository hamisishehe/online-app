"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, deleteCourse, updateCourse, updateSiteSettings } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CkEditor4Textarea } from "@/components/ckeditor4-textarea";
import { sidebarThemeOptions, themeOptions } from "@/lib/theme";

type Settings = {
  id: number;
  portalName: string;
  heroTitle: string;
  heroDescription: string;
  ctaText: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  primaryTheme?: string | null;
  sidebarTheme?: string | null;
  headerTheme?: string | null;
} | null;

type Course = {
  id: number;
  title: string;
  duration: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

function isHexColor(value: string | null | undefined) {
  if (!value) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function ThemeColorField({
  label,
  name,
  presets,
  defaultPreset,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  presets: { value: string; label: string }[];
  defaultPreset: string;
  defaultValue?: string | null;
  disabled?: boolean;
}) {
  const initialIsCustom = isHexColor(defaultValue ?? null);
  const initialPreset = !initialIsCustom && defaultValue ? defaultValue : defaultPreset;
  const initialCustom = initialIsCustom ? (defaultValue as string) : "#0ea5e9";

  const [mode, setMode] = useState<"preset" | "custom">(initialIsCustom ? "custom" : "preset");
  const [preset, setPreset] = useState(initialPreset);
  const [custom, setCustom] = useState(initialCustom);

  const value = useMemo(() => (mode === "custom" ? custom : preset), [custom, mode, preset]);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "preset"}
            onChange={() => setMode("preset")}
            disabled={disabled}
            className="h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
          />
          Preset
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "custom"}
            onChange={() => setMode("custom")}
            disabled={disabled}
            className="h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
          />
          Custom
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <select
          value={preset}
          disabled={disabled || mode === "custom"}
          onChange={(e) => setPreset(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          {presets.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm shadow-xs">
          <input
            type="color"
            value={custom}
            disabled={disabled || mode === "preset"}
            onChange={(e) => setCustom(e.target.value)}
            className="h-7 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0"
          />
          <div className="text-xs text-muted-foreground">
            Pick a custom color (hex).
          </div>
        </div>
      </div>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-hidden",
        "focus-visible:ring-2 focus-visible:ring-ring",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function NativeCheckbox({
  name,
  defaultChecked,
}: {
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <input
      type="checkbox"
      name={name}
      defaultChecked={defaultChecked}
      className="h-4 w-4 rounded border border-input bg-background align-middle text-primary shadow-xs focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function CourseCreateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createCourse, undefined);

  useEffect(() => {
    if (state?.message === "Course added.") router.refresh();
  }, [state?.message, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add course</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} encType="multipart/form-data" className="grid gap-4">
          {state?.message ? (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="courseTitle">Title</Label>
            <Input id="courseTitle" name="title" required />
            {state?.errors?.title?.[0] ? (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courseDuration">Duration (optional)</Label>
            <Input id="courseDuration" name="duration" placeholder="e.g. 4 weeks" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courseSortOrder">Sort order</Label>
            <Input id="courseSortOrder" name="sortOrder" type="number" defaultValue={0} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courseDescription">Description (optional)</Label>
            <Textarea id="courseDescription" name="description" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courseImageUrl">Image URL (optional)</Label>
            <Input id="courseImageUrl" name="imageUrl" placeholder="/uploads/..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courseImageFile">Or upload image</Label>
            <Input id="courseImageFile" name="imageFile" type="file" accept="image/*" />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add course"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CourseEditCard({ course }: { course: Course }) {
  const router = useRouter();
  const [updateState, updateAction, updatePending] = useActionState(updateCourse, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCourse, undefined);

  useEffect(() => {
    if (updateState?.message === "Course updated.") router.refresh();
  }, [updateState?.message, router]);

  useEffect(() => {
    if (deleteState?.message === "Course deleted.") router.refresh();
  }, [deleteState?.message, router]);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{course.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={course.isActive ? "default" : "secondary"}>
              {course.isActive ? "Active" : "Hidden"}
            </Badge>
            <Badge variant="secondary">#{course.sortOrder}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {course.imageUrl ? (
          <div className="overflow-hidden rounded-lg border">
            <img src={course.imageUrl} alt={course.title} className="h-40 w-full object-cover" />
          </div>
        ) : null}

        <form action={updateAction} encType="multipart/form-data" className="grid gap-4">
          {updateState?.message ? (
            <p className="text-sm text-muted-foreground">{updateState.message}</p>
          ) : null}

          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="currentImageUrl" value={course.imageUrl ?? ""} />

          <div className="grid gap-2">
            <Label htmlFor={`title-${course.id}`}>Title</Label>
            <Input id={`title-${course.id}`} name="title" defaultValue={course.title} required />
            {updateState?.errors?.title?.[0] ? (
              <p className="text-xs text-destructive">{updateState.errors.title[0]}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`duration-${course.id}`}>Duration</Label>
            <Input id={`duration-${course.id}`} name="duration" defaultValue={course.duration ?? ""} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`sortOrder-${course.id}`}>Sort order</Label>
            <Input
              id={`sortOrder-${course.id}`}
              name="sortOrder"
              type="number"
              defaultValue={course.sortOrder}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`isActive-${course.id}`}>Visibility</Label>
            <select
              id={`isActive-${course.id}`}
              name="isActive"
              defaultValue={String(course.isActive)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="true">Active (show on homepage)</option>
              <option value="false">Hidden</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`description-${course.id}`}>Description</Label>
            <Textarea id={`description-${course.id}`} name="description" defaultValue={course.description ?? ""} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`imageUrl-${course.id}`}>Image URL</Label>
            <Input id={`imageUrl-${course.id}`} name="imageUrl" defaultValue={course.imageUrl ?? ""} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`imageFile-${course.id}`}>Or upload new image</Label>
            <Input id={`imageFile-${course.id}`} name="imageFile" type="file" accept="image/*" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <NativeCheckbox name="removeImage" />
            Remove image
          </label>

          <Button type="submit" disabled={updatePending}>
            {updatePending ? "Saving..." : "Save changes"}
          </Button>
        </form>

        <form action={deleteAction} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <input type="hidden" name="courseId" value={course.id} />
          <div className="text-sm">
            <div className="font-medium">Delete course</div>
            <div className="text-xs text-muted-foreground">This cannot be undone.</div>
          </div>
          <div className="text-right">
            {deleteState?.message ? (
              <div className="text-xs text-muted-foreground">{deleteState.message}</div>
            ) : null}
            <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
              {deletePending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}

export function AdminSettingsClient({
  settings,
  courses,
}: {
  settings: Settings;
  courses: Course[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateSiteSettings, undefined);

  useEffect(() => {
    if (state?.message === "Homepage content updated.") router.refresh();
  }, [state?.message, router]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Hero content</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} encType="multipart/form-data" className="grid gap-4">
            {state?.message ? (
              <p className="text-sm text-muted-foreground">{state.message}</p>
            ) : null}

            <input type="hidden" name="currentLogoUrl" value={settings?.logoUrl ?? ""} />
            <input type="hidden" name="currentHeroUrl" value={settings?.heroImageUrl ?? ""} />

            <div className="grid gap-2">
              <Label htmlFor="portalName">Portal name</Label>
              <Input id="portalName" name="portalName" defaultValue={settings?.portalName ?? "Online Application"} required />
              {state?.errors?.portalName?.[0] ? (
                <p className="text-xs text-destructive">{state.errors.portalName[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="heroTitle">Hero title</Label>
              <Input id="heroTitle" name="heroTitle" defaultValue={settings?.heroTitle ?? "Apply for short courses"} required />
              {state?.errors?.heroTitle?.[0] ? (
                <p className="text-xs text-destructive">{state.errors.heroTitle[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="heroDescription">Hero description</Label>
              <CkEditor4Textarea
                id="heroDescription"
                name="heroDescription"
                defaultValue={
                  settings?.heroDescription ??
                  "Create an account, fill your education details, and submit your application."
                }
                disabled={isPending}
                minHeight={180}
              />
              {state?.errors?.heroDescription?.[0] ? (
                <p className="text-xs text-destructive">{state.errors.heroDescription[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ctaText">CTA button text</Label>
              <Input id="ctaText" name="ctaText" defaultValue={settings?.ctaText ?? "Start application"} required />
              {state?.errors?.ctaText?.[0] ? (
                <p className="text-xs text-destructive">{state.errors.ctaText[0]}</p>
              ) : null}
            </div>

            <div className="grid gap-4 rounded-xl border bg-muted/10 p-4 md:grid-cols-3">
              <ThemeColorField
                label="Primary color"
                name="primaryTheme"
                presets={themeOptions as unknown as { value: string; label: string }[]}
                defaultPreset="sky"
                defaultValue={settings?.primaryTheme ?? "sky"}
                disabled={isPending}
              />

              <ThemeColorField
                label="Sidebar color"
                name="sidebarTheme"
                presets={sidebarThemeOptions as unknown as { value: string; label: string }[]}
                defaultPreset="light"
                defaultValue={settings?.sidebarTheme ?? "light"}
                disabled={isPending}
              />

              <ThemeColorField
                label="Header color"
                name="headerTheme"
                presets={themeOptions as unknown as { value: string; label: string }[]}
                defaultPreset="default"
                defaultValue={settings?.headerTheme ?? "default"}
                disabled={isPending}
              />

              <p className="text-xs text-muted-foreground md:col-span-3">
                Theme changes apply to the sidebar + top header across the app.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input id="logoUrl" name="logoUrl" defaultValue={settings?.logoUrl ?? ""} placeholder="/uploads/logo.png" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logoFile">Or upload logo</Label>
              <Input id="logoFile" name="logoFile" type="file" accept="image/*" />
              {settings?.logoUrl ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <img
                    src={settings.logoUrl}
                    alt="Current logo"
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="text-xs text-muted-foreground">
                    Current: <span className="font-mono">{settings.logoUrl}</span>
                  </div>
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <NativeCheckbox name="removeLogo" />
                Remove logo
              </label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="heroImageUrl">Hero image URL (optional)</Label>
              <Input id="heroImageUrl" name="heroImageUrl" defaultValue={settings?.heroImageUrl ?? ""} placeholder="/uploads/hero.png" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="heroFile">Or upload hero image</Label>
              <Input id="heroFile" name="heroFile" type="file" accept="image/*" />
              {settings?.heroImageUrl ? (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={settings.heroImageUrl}
                    alt="Current hero"
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <NativeCheckbox name="removeHero" />
                Remove hero image
              </label>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save homepage"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CourseCreateForm />
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Changes are applied immediately on the public homepage (`/`).
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <h3 className="text-base font-semibold">Courses</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <CourseEditCard key={course.id} course={course} />
          ))}
          {courses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No courses yet. Add one above.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
