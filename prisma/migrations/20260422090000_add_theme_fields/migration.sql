-- Add theme fields for dynamic colors
ALTER TABLE "site_settings"
ADD COLUMN "primaryTheme" TEXT NOT NULL DEFAULT 'sky',
ADD COLUMN "sidebarTheme" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN "headerTheme" TEXT NOT NULL DEFAULT 'default';

