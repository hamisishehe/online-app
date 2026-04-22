"use client";

import * as React from "react";

declare global {
  interface Window {
    CKEDITOR?: {
      replace: (id: string, config?: Record<string, unknown>) => unknown;
      instances?: Record<
        string,
        { on?: (evt: string, cb: () => void) => void; updateElement?: () => void; destroy?: (force?: boolean) => void; setReadOnly?: (v: boolean) => void }
      >;
    };
  }
}

const CKEDITOR_SRC = "https://cdn.ckeditor.com/4.25.1-lts/standard/ckeditor.js";

function loadCkeditor4(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.CKEDITOR) return Promise.resolve();

  const existing = document.querySelector(`script[src="${CKEDITOR_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CKEDITOR_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export function CkEditor4Textarea({
  id,
  name,
  defaultValue,
  disabled,
  minHeight = 160,
  className,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  minHeight?: number;
  className?: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    let destroyed = false;

    async function setup() {
      if (disabled) return;
      if (!textareaRef.current) return;

      await loadCkeditor4();
      if (destroyed) return;

      const ck = window.CKEDITOR;
      if (!ck) return;

      const instances = ck.instances ?? {};
      if (instances[id]) return;

      ck.replace(id, {
        height: minHeight,
        removeButtons: "PasteFromWord",
      });

      const editor = ck.instances?.[id];
      editor?.on?.("change", () => editor.updateElement?.());
    }

    setup();

    return () => {
      destroyed = true;
      const editor = window.CKEDITOR?.instances?.[id];
      editor?.destroy?.(true);
    };
  }, [disabled, id, minHeight]);

  React.useEffect(() => {
    const editor = window.CKEDITOR?.instances?.[id];
    if (disabled) editor?.setReadOnly?.(true);
  }, [disabled, id]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      name={name}
      defaultValue={defaultValue}
      disabled={disabled}
      className={[
        "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-hidden",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
