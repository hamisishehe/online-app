import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getUploadRootDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (!configured) {
    return path.join(process.cwd(), "public", "uploads");
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

function getContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await context.params;

  if (!parts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const uploadRoot = path.resolve(getUploadRootDir());
  const targetPath = path.resolve(uploadRoot, ...parts);

  if (!targetPath.startsWith(uploadRoot)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await readFile(targetPath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": getContentType(targetPath),
        "Cache-Control": "public, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
