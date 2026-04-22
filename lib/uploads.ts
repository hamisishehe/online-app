import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

function normalizePublicBase() {
  const base = (process.env.UPLOAD_PUBLIC_BASE ?? "/uploads").trim();
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/+$/, "");
  }
  if (!base.startsWith("/")) return `/${base.replace(/^\/+/, "")}`;
  return base.replace(/\/+$/, "") || "/uploads";
}

function getUploadRootDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (!configured) {
    return path.join(process.cwd(), "public", "uploads");
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

function sanitizeSegment(segment: string) {
  return segment.replace(/[\\/]+/g, "-").replace(/^\.+/, "").trim();
}

export async function saveUploadedFile(options: {
  file: File | null;
  allowedMimeTypes: Set<string>;
  allowedExtensions: string[];
  fallbackExtension: string;
  subdir?: string;
}) {
  const { file, allowedMimeTypes, allowedExtensions, fallbackExtension, subdir } = options;

  if (!file || file.size === 0) return null;

  if (!allowedMimeTypes.has(file.type)) {
    throw new UploadError("Unsupported file type.");
  }

  const extRaw = path.extname(file.name || "").toLowerCase();
  const ext = allowedExtensions.includes(extRaw) ? extRaw : fallbackExtension;

  const rootDir = getUploadRootDir();
  const subdirSafe = subdir ? sanitizeSegment(subdir) : "";
  const destinationDir = subdirSafe ? path.join(rootDir, subdirSafe) : rootDir;

  try {
    await mkdir(destinationDir, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filepath = path.join(destinationDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filepath, buffer);

    const publicBase = normalizePublicBase();
    return subdirSafe
      ? `${publicBase}/${subdirSafe}/${filename}`
      : `${publicBase}/${filename}`;
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
        throw new UploadError(
          "Upload directory is not writable on this server. Set a writable UPLOAD_DIR and restart the app."
        );
      }
    }

    throw new UploadError("Failed to save the uploaded file on the server.");
  }
}
