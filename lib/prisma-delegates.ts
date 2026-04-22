import { prisma } from "@/lib/prisma";

export function getPrismaDelegate(name: string): unknown {
  const client = prisma as unknown as Record<string, unknown>;
  return client[name];
}

export function hasFunction(
  obj: unknown,
  fnName: string
): obj is Record<string, (...args: unknown[]) => unknown> {
  if (!obj) return false;
  const record = obj as Record<string, unknown>;
  return typeof record[fnName] === "function";
}
