"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/format";
import { getCurrentUser } from "@/server/auth";
import {
  archiveProject,
  createAlbumVersion,
  createProject,
  createShareLink,
  deleteSpread,
  getProjectDetail,
  reorderSpread,
  replaceSpread,
  resolveComment,
  uploadSpreads,
  updateStudio,
} from "@/server/store";
import { sendEmailOrLog } from "@/server/email";
import {
  projectSchema,
  reorderSpreadSchema,
  resolveCommentSchema,
  shareLinkSchema,
  spreadMutationSchema,
  studioSchema,
  uploadSpreadSchema,
} from "@/server/schema";

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return user.id;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUploadFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "name" in value &&
    "size" in value
  );
}

export async function updateStudioAction(formData: FormData) {
  const userId = await requireUserId();
  const input = studioSchema.parse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl"),
    brandColor: formData.get("brandColor"),
  });

  await updateStudio(userId, input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function createProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const input = projectSchema.parse({
    title: formData.get("title"),
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
  });

  const { project } = await createProject(userId, input);
  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${project.id}`);
}

export async function archiveProjectAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = formString(formData, "projectId");

  await archiveProject(userId, projectId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createVersionAction(formData: FormData) {
  const userId = await requireUserId();
  const projectId = formString(formData, "projectId");

  await createAlbumVersion(userId, projectId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function uploadSpreadsAction(formData: FormData) {
  const userId = await requireUserId();
  const input = uploadSpreadSchema.parse({
    projectId: formData.get("projectId"),
    albumVersionId: formData.get("albumVersionId"),
  });
  const files = formData
    .getAll("spreads")
    .filter(isUploadFile)
    .filter((file) => file.size > 0);

  await uploadSpreads(userId, { ...input, files });
  revalidatePath(`/dashboard/projects/${input.projectId}`);
}

export async function reorderSpreadAction(formData: FormData) {
  const userId = await requireUserId();
  const input = reorderSpreadSchema.parse({
    projectId: formData.get("projectId"),
    albumVersionId: formData.get("albumVersionId"),
    spreadId: formData.get("spreadId"),
    direction: formData.get("direction"),
  });

  await reorderSpread(userId, input);
  revalidatePath(`/dashboard/projects/${input.projectId}`);
}

export async function deleteSpreadAction(formData: FormData) {
  const userId = await requireUserId();
  const input = spreadMutationSchema.parse({
    projectId: formData.get("projectId"),
    albumVersionId: formData.get("albumVersionId"),
    spreadId: formData.get("spreadId"),
  });

  await deleteSpread(userId, input);
  revalidatePath(`/dashboard/projects/${input.projectId}`);
}

export async function replaceSpreadAction(formData: FormData) {
  const userId = await requireUserId();
  const input = spreadMutationSchema.parse({
    projectId: formData.get("projectId"),
    albumVersionId: formData.get("albumVersionId"),
    spreadId: formData.get("spreadId"),
  });
  const file = formData.get("replacement");

  if (!file || !isUploadFile(file) || file.size === 0) {
    throw new Error("Choose a replacement JPG or PNG file.");
  }

  await replaceSpread(userId, { ...input, file });
  revalidatePath(`/dashboard/projects/${input.projectId}`);
}

export async function createShareLinkAction(formData: FormData) {
  const userId = await requireUserId();
  const rawExpiresAt = formString(formData, "expiresAt");
  const expiresAt = rawExpiresAt ? new Date(rawExpiresAt).toISOString() : "";
  const input = shareLinkSchema.parse({
    projectId: formData.get("projectId"),
    albumVersionId: formData.get("albumVersionId"),
    password: formData.get("password"),
    expiresAt,
  });

  const { token } = await createShareLink(userId, input);
  const detail = await getProjectDetail(userId, input.projectId);
  const proofUrl = absoluteUrl(`/proof/${token}`);

  await sendEmailOrLog({
    studioId: detail.studio.id,
    projectId: detail.id,
    to: detail.client.email,
    subject: `${detail.studio.name}: ${detail.title} is ready to review`,
    type: "share_link",
    html: `<p>Your album proof is ready.</p><p><a href="${proofUrl}">Open proof</a></p>`,
  });

  revalidatePath(`/dashboard/projects/${input.projectId}`);
  redirect(
    `/dashboard/projects/${input.projectId}?shareToken=${encodeURIComponent(token)}`,
  );
}

export async function resolveCommentAction(formData: FormData) {
  const userId = await requireUserId();
  const input = resolveCommentSchema.parse({
    projectId: formData.get("projectId"),
    commentId: formData.get("commentId"),
  });

  await resolveComment(userId, input.projectId, input.commentId);
  revalidatePath(`/dashboard/projects/${input.projectId}`);
}
