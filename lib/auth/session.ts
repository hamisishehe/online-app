import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: number;
  role: "APPLICANT" | "ADMIN";
};

const COOKIE_NAME = "session";

function isSecureCookieEnabled() {
  const value = process.env.SESSION_COOKIE_SECURE;
  if (value === "true") return true;
  if (value === "false") return false;
  return process.env.NODE_ENV === "production";
}

function getEncodedKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: isSecureCookieEnabled(),
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    const userId = payload.userId;
    const role = payload.role;

    if (typeof userId !== "number") return null;
    if (role !== "APPLICANT" && role !== "ADMIN") return null;

    return { userId, role };
  } catch {
    return null;
  }
}
