"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashIp } from "@/server/security";
import { proofCommentSchema, proofDecisionSchema } from "@/server/schema";
import {
  addCommentByToken,
  getProofByToken,
  submitDecisionByToken,
} from "@/server/store";
import { grantProofAccess, hasProofAccess } from "@/server/proof-access";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function unlockProofAction(formData: FormData) {
  const token = formString(formData, "token");
  const password = formString(formData, "password");
  const proof = await getProofByToken(token, password);

  if (!proof) {
    redirect(`/proof/${encodeURIComponent(token)}?error=invalid-password`);
  }

  await grantProofAccess(token);
  redirect(`/proof/${encodeURIComponent(token)}`);
}

export async function addProofCommentAction(formData: FormData) {
  const input = proofCommentSchema.parse({
    token: formData.get("token"),
    password: formData.get("password"),
    spreadId: formData.get("spreadId"),
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    body: formData.get("body"),
    x: formData.get("x") || undefined,
    y: formData.get("y") || undefined,
  });
  const accessGranted = await hasProofAccess(input.token);

  await addCommentByToken({ ...input, accessGranted });
  redirect(
    `/proof/${encodeURIComponent(input.token)}?client=${encodeURIComponent(
      input.authorName,
    )}&email=${encodeURIComponent(input.authorEmail)}#spread-${input.spreadId}`,
  );
}

export async function submitProofDecisionAction(formData: FormData) {
  const input = proofDecisionSchema.parse({
    token: formData.get("token"),
    password: formData.get("password"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    decision: formData.get("decision"),
    message: formData.get("message"),
  });
  const headersList = await headers();
  const accessGranted = await hasProofAccess(input.token);

  await submitDecisionByToken({
    ...input,
    accessGranted,
    ipHash: hashIp(headersList.get("x-forwarded-for")),
  });
  redirect(
    `/proof/${encodeURIComponent(input.token)}?submitted=${input.decision}`,
  );
}
