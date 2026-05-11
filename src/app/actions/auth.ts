"use server";

import { redirect } from "next/navigation";
import { authSchema } from "@/server/schema";
import { setSession, clearSession } from "@/server/auth";
import { DEMO_USER_ID } from "@/server/store";

export async function signInAction(formData: FormData) {
  authSchema.parse({
    email: formData.get("email"),
  });

  await setSession(DEMO_USER_ID);
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  authSchema.parse({
    email: formData.get("email"),
    name: formData.get("name"),
  });

  await setSession(DEMO_USER_ID);
  redirect("/dashboard/settings");
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}
