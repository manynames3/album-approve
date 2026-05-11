import { cookies } from "next/headers";
import { hmacDigest, isSafeEqual } from "@/server/security";
import { DEMO_USER_ID, getUser } from "@/server/store";

export const SESSION_COOKIE = "proofalbum_session";

function createSessionValue(userId: string) {
  return `${userId}.${hmacDigest(`session:${userId}`)}`;
}

function verifySessionValue(value?: string) {
  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");
  if (!userId || !signature) {
    return null;
  }

  const expected = hmacDigest(`session:${userId}`);
  return isSafeEqual(signature, expected) ? userId : null;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = verifySessionValue(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId) {
    return null;
  }

  return getUser(userId);
}

export async function setSession(userId = DEMO_USER_ID) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
