import { cookies } from "next/headers";
import { hmacDigest, hashShareToken, isSafeEqual } from "@/server/security";

function proofAccessCookieName(token: string) {
  return `proofalbum_proof_${hmacDigest(`proof-cookie:${token}`).slice(0, 20)}`;
}

function proofAccessValue(token: string) {
  return hmacDigest(`proof-access:${hashShareToken(token)}`);
}

export async function hasProofAccess(token: string) {
  const cookieStore = await cookies();
  const value = cookieStore.get(proofAccessCookieName(token))?.value;

  if (!value) {
    return false;
  }

  return isSafeEqual(value, proofAccessValue(token));
}

export async function grantProofAccess(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(proofAccessCookieName(token), proofAccessValue(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/proof",
    maxAge: 60 * 60 * 24 * 14,
  });
}
