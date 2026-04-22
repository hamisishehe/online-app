type ThemeKey = "default" | "sky" | "emerald" | "indigo" | "rose" | "slate";
type SidebarThemeKey = "light" | "dark" | "slate";

function isHexColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function hexToRgb(hex: string) {
  const raw = hex.replace("#", "").trim();
  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return { r, g, b };
}

function srgbToLinear(v: number) {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function pickForegroundForBackground(hex: string) {
  // Rough contrast split
  return relativeLuminance(hex) > 0.5 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)";
}

const primaryThemes: Record<
  ThemeKey,
  { primary: string; primaryFg: string }
> = {
  default: {
    primary: "oklch(0.205 0 0)",
    primaryFg: "oklch(0.985 0 0)",
  },
  sky: {
    primary: "oklch(0.62 0.19 240)",
    primaryFg: "oklch(0.985 0 0)",
  },
  emerald: {
    primary: "oklch(0.64 0.18 153)",
    primaryFg: "oklch(0.985 0 0)",
  },
  indigo: {
    primary: "oklch(0.59 0.21 270)",
    primaryFg: "oklch(0.985 0 0)",
  },
  rose: {
    primary: "oklch(0.63 0.23 25)",
    primaryFg: "oklch(0.985 0 0)",
  },
  slate: {
    primary: "oklch(0.33 0 0)",
    primaryFg: "oklch(0.985 0 0)",
  },
};

const sidebarThemes: Record<
  SidebarThemeKey,
  {
    sidebar: string;
    sidebarFg: string;
    sidebarPrimary: string;
    sidebarPrimaryFg: string;
    sidebarAccent: string;
    sidebarAccentFg: string;
    sidebarBorder: string;
    sidebarRing: string;
  }
> = {
  light: {
    sidebar: "oklch(0.985 0 0)",
    sidebarFg: "oklch(0.145 0 0)",
    sidebarPrimary: "oklch(0.205 0 0)",
    sidebarPrimaryFg: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.97 0 0)",
    sidebarAccentFg: "oklch(0.205 0 0)",
    sidebarBorder: "oklch(0.922 0 0)",
    sidebarRing: "oklch(0.708 0 0)",
  },
  dark: {
    sidebar: "oklch(0.205 0 0)",
    sidebarFg: "oklch(0.985 0 0)",
    sidebarPrimary: "oklch(0.62 0.19 240)",
    sidebarPrimaryFg: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.269 0 0)",
    sidebarAccentFg: "oklch(0.985 0 0)",
    sidebarBorder: "oklch(1 0 0 / 10%)",
    sidebarRing: "oklch(0.556 0 0)",
  },
  slate: {
    sidebar: "oklch(0.24 0 0)",
    sidebarFg: "oklch(0.985 0 0)",
    sidebarPrimary: "oklch(0.62 0.19 240)",
    sidebarPrimaryFg: "oklch(0.985 0 0)",
    sidebarAccent: "oklch(0.3 0 0)",
    sidebarAccentFg: "oklch(0.985 0 0)",
    sidebarBorder: "oklch(1 0 0 / 10%)",
    sidebarRing: "oklch(0.556 0 0)",
  },
};

const headerThemes: Record<
  ThemeKey,
  { headerBg: string; headerFg: string }
> = {
  default: {
    headerBg: "oklch(1 0 0)",
    headerFg: "oklch(0.145 0 0)",
  },
  sky: {
    headerBg: "oklch(0.62 0.19 240)",
    headerFg: "oklch(0.985 0 0)",
  },
  emerald: {
    headerBg: "oklch(0.64 0.18 153)",
    headerFg: "oklch(0.985 0 0)",
  },
  indigo: {
    headerBg: "oklch(0.59 0.21 270)",
    headerFg: "oklch(0.985 0 0)",
  },
  rose: {
    headerBg: "oklch(0.63 0.23 25)",
    headerFg: "oklch(0.985 0 0)",
  },
  slate: {
    headerBg: "oklch(0.205 0 0)",
    headerFg: "oklch(0.985 0 0)",
  },
};

function asThemeKey(value: unknown, fallback: ThemeKey): ThemeKey | null {
  return typeof value === "string" && value in primaryThemes ? (value as ThemeKey) : fallback;
}

function asSidebarKey(value: unknown, fallback: SidebarThemeKey): SidebarThemeKey {
  return typeof value === "string" && value in sidebarThemes ? (value as SidebarThemeKey) : fallback;
}

export function getThemeCssVars(settings: {
  primaryTheme?: string | null;
  sidebarTheme?: string | null;
  headerTheme?: string | null;
} | null): Record<string, string> {
  const primaryRaw = settings?.primaryTheme;
  const sidebarRaw = settings?.sidebarTheme;
  const headerRaw = settings?.headerTheme;

  const primaryKey = asThemeKey(primaryRaw, "sky");
  const headerKey = asThemeKey(headerRaw, "default");
  const sidebarKey = asSidebarKey(sidebarRaw, "light");

  const primary =
    isHexColor(primaryRaw)
      ? { primary: primaryRaw.trim(), primaryFg: pickForegroundForBackground(primaryRaw.trim()) }
      : primaryThemes[primaryKey ?? "sky"];

  const header =
    isHexColor(headerRaw)
      ? { headerBg: headerRaw.trim(), headerFg: pickForegroundForBackground(headerRaw.trim()) }
      : headerThemes[headerKey ?? "default"];

  const sidebar =
    isHexColor(sidebarRaw)
      ? {
          sidebar: sidebarRaw.trim(),
          sidebarFg: pickForegroundForBackground(sidebarRaw.trim()),
          sidebarPrimary: "var(--primary)",
          sidebarPrimaryFg: "var(--primary-foreground)",
          sidebarAccent: "color-mix(in oklab, var(--sidebar) 88%, white)",
          sidebarAccentFg: "var(--sidebar-foreground)",
          sidebarBorder: "color-mix(in oklab, var(--sidebar) 86%, black)",
          sidebarRing: "color-mix(in oklab, var(--sidebar) 60%, white)",
        }
      : sidebarThemes[sidebarKey];

  return {
    "--primary": primary.primary,
    "--primary-foreground": primary.primaryFg,
    "--sidebar": sidebar.sidebar,
    "--sidebar-foreground": sidebar.sidebarFg,
    "--sidebar-primary": sidebar.sidebarPrimary,
    "--sidebar-primary-foreground": sidebar.sidebarPrimaryFg,
    "--sidebar-accent": sidebar.sidebarAccent,
    "--sidebar-accent-foreground": sidebar.sidebarAccentFg,
    "--sidebar-border": sidebar.sidebarBorder,
    "--sidebar-ring": sidebar.sidebarRing,
    "--app-header-bg": header.headerBg,
    "--app-header-fg": header.headerFg,
  };
}

export const themeOptions = [
  { value: "default", label: "Default" },
  { value: "sky", label: "Sky" },
  { value: "emerald", label: "Emerald" },
  { value: "indigo", label: "Indigo" },
  { value: "rose", label: "Rose" },
  { value: "slate", label: "Slate" },
] as const;

export const sidebarThemeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "slate", label: "Slate" },
] as const;
