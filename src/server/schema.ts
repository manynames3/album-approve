import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254);

export const authSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2).max(80).optional(),
});

export const studioSchema = z.object({
  name: z.string().trim().min(2).max(80),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .or(z.literal("")),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  clientName: z.string().trim().min(2).max(100),
  clientEmail: emailSchema,
  clientPhone: z.string().trim().max(40).optional().or(z.literal("")),
});

export const shareLinkSchema = z.object({
  projectId: z.string().min(1),
  albumVersionId: z.string().min(1),
  password: z.string().trim().min(6).max(80).optional().or(z.literal("")),
  expiresAt: z.string().trim().datetime().optional().or(z.literal("")),
});

export const proofCommentSchema = z.object({
  token: z.string().min(8),
  password: z.string().optional(),
  spreadId: z.string().min(1),
  authorName: z.string().trim().min(2).max(100),
  authorEmail: emailSchema,
  body: z.string().trim().min(2).max(1200),
  x: z.coerce.number().min(0).max(1).optional(),
  y: z.coerce.number().min(0).max(1).optional(),
});

export const proofDecisionSchema = z
  .object({
    token: z.string().min(8),
    password: z.string().optional(),
    clientName: z.string().trim().min(2).max(100),
    clientEmail: emailSchema,
    decision: z.enum(["approved", "changes_requested"]),
    message: z.string().trim().max(1200).optional().or(z.literal("")),
  })
  .superRefine((value, context) => {
    if (value.decision === "changes_requested" && !value.message?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["message"],
        message: "A request-changes decision needs a short note.",
      });
    }
  });

export const resolveCommentSchema = z.object({
  projectId: z.string().min(1),
  commentId: z.string().min(1),
});

export const spreadMutationSchema = z.object({
  projectId: z.string().min(1),
  albumVersionId: z.string().min(1),
  spreadId: z.string().min(1),
});

export const reorderSpreadSchema = spreadMutationSchema.extend({
  direction: z.enum(["up", "down"]),
});

export const uploadSpreadSchema = z.object({
  projectId: z.string().min(1),
  albumVersionId: z.string().min(1),
});

export const planSchema = z.enum(["free", "starter", "pro", "studio"]);
