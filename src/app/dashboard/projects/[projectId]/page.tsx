import Link from "next/link";
import type React from "react";
import {
  Archive,
  CheckCircle2,
  Download,
  ExternalLink,
  FileImage,
  Link2,
  MessageSquareText,
  Plus,
  Send,
} from "lucide-react";
import {
  archiveProjectAction,
  createShareLinkAction,
  createVersionAction,
  resolveCommentAction,
} from "@/app/actions/dashboard";
import { SpreadManager } from "@/components/dashboard/spread-manager";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { absoluteUrl, formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/server/auth";
import { DEMO_SHARE_TOKEN, getProjectDetail } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ shareToken?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const { projectId } = await params;
  const { shareToken } = await searchParams;
  const project = await getProjectDetail(user.id, projectId);
  const latestVersion = project.versions[0];
  const newShareUrl = shareToken ? absoluteUrl(`/proof/${shareToken}`) : null;
  const latestOpenComments = latestVersion
    ? latestVersion.comments.filter((comment) => !comment.resolvedAt).length
    : 0;
  const latestSpreadCount = latestVersion?.spreads.length || 0;
  const latestApprovalCount = latestVersion?.approvals.length || 0;

  return (
    <div className="min-w-0 space-y-7">
      <section className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="h-7 px-0 text-teal-700"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <StatusBadge status={project.status} />
              {latestVersion ? (
                <StatusBadge status={latestVersion.status} />
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 text-sm text-zinc-600">
              {project.client.name} · {project.client.email}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-2">
                <a href={`/api/comments/export/${project.id}`}>
                  <Download className="size-4" aria-hidden="true" />
                  Export CSV
                </a>
              </Button>
              <form action={archiveProjectAction}>
                <input type="hidden" name="projectId" value={project.id} />
                <Button variant="outline" className="gap-2">
                  <Archive className="size-4" aria-hidden="true" />
                  Archive
                </Button>
              </form>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-[#fbfaf6] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Review path
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <FlowItem
                icon={FileImage}
                label={`${latestSpreadCount} design spreads uploaded`}
                tone="teal"
              />
              <FlowItem
                icon={Send}
                label={
                  latestVersion
                    ? `v${latestVersion.versionNumber} flipbook shared`
                    : "No version yet"
                }
                tone="blue"
              />
              <FlowItem
                icon={MessageSquareText}
                label={`${latestOpenComments} open comments`}
                tone="amber"
              />
              <FlowItem
                icon={CheckCircle2}
                label={`${latestApprovalCount} approval records`}
                tone="emerald"
              />
            </div>
          </div>
        </div>
      </section>

      {newShareUrl ? (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-950">
                Share link created
              </p>
              <p className="break-all text-sm text-teal-800">{newShareUrl}</p>
            </div>
            <Button asChild variant="outline" className="gap-2 bg-white">
              <a href={newShareUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" aria-hidden="true" />
                Open
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 md:grid-cols-4">
        <InfoCard
          label="Project status"
          value={<StatusBadge status={project.status} />}
          helper="Studio-side state"
        />
        <InfoCard
          label="Latest version"
          value={latestVersion ? `v${latestVersion.versionNumber}` : "None"}
          helper={`${latestSpreadCount} spreads`}
        />
        <InfoCard
          label="Open comments"
          value={latestOpenComments}
          helper="Needs studio action"
        />
        <InfoCard
          label="Subscription"
          value={project.subscription?.plan || "free"}
          helper={project.subscription?.status || "trialing"}
        />
      </section>

      <Tabs defaultValue={latestVersion?.id} className="gap-4">
        <TabsList>
          {project.versions.map((version) => (
            <TabsTrigger key={version.id} value={version.id}>
              v{version.versionNumber}
            </TabsTrigger>
          ))}
        </TabsList>
        {project.versions.map((version) => {
          const shareUrl = version.shareLinks.some(
            (link) => link.id === "share_demo",
          )
            ? absoluteUrl(`/proof/${DEMO_SHARE_TOKEN}`)
            : null;

          return (
            <TabsContent
              key={version.id}
              value={version.id}
              className="space-y-6"
            >
              <SpreadManager
                projectId={project.id}
                albumVersionId={version.id}
                spreads={version.spreads.map((spread) => {
                  const spreadComments = version.comments.filter(
                    (comment) => comment.spreadId === spread.id,
                  );

                  return {
                    ...spread,
                    commentCount: spreadComments.length,
                    openCommentCount: spreadComments.filter(
                      (comment) => !comment.resolvedAt,
                    ).length,
                  };
                })}
              />

              <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>Proofing link</CardTitle>
                        <CardDescription>
                          Share the flippable, commentable album proof with the
                          client.
                        </CardDescription>
                      </div>
                      <StatusBadge status={version.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shareUrl ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full gap-2 sm:w-auto"
                      >
                        <a href={shareUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" aria-hidden="true" />
                          Open client proof
                        </a>
                      </Button>
                    ) : null}
                    <form
                      action={createShareLinkAction}
                      className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <input
                        type="hidden"
                        name="albumVersionId"
                        value={version.id}
                      />
                      <div className="space-y-2">
                        <Label htmlFor={`password-${version.id}`}>
                          Optional password
                        </Label>
                        <Input
                          id={`password-${version.id}`}
                          name="password"
                          minLength={6}
                          placeholder="Leave blank for token-only access"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`expires-${version.id}`}>
                          Expiration
                        </Label>
                        <Input
                          id={`expires-${version.id}`}
                          name="expiresAt"
                          type="datetime-local"
                        />
                      </div>
                      <Button className="self-end gap-2">
                        <Link2 className="size-4" aria-hidden="true" />
                        Create proof link
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revision</CardTitle>
                    <CardDescription>
                      Start a new version for replacement rounds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={createVersionAction}>
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <Button variant="outline" className="w-full gap-2">
                        <Plus className="size-4" aria-hidden="true" />
                        Create revised version
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </section>

              <Card>
                <CardHeader>
                  <CardTitle>Comments and approvals</CardTitle>
                  <CardDescription>
                    Spread-specific feedback, resolution status, and approval
                    history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {version.comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{comment.authorName}</p>
                            <p className="text-xs text-zinc-500">
                              {comment.spread?.filename || "Unknown spread"} ·{" "}
                              {formatDateTime(comment.createdAt)}
                            </p>
                          </div>
                          <StatusBadge
                            status={
                              comment.resolvedAt
                                ? "approved"
                                : "changes_requested"
                            }
                          />
                        </div>
                        <p className="mt-3 text-sm text-zinc-700">
                          {comment.body}
                        </p>
                        {!comment.resolvedAt ? (
                          <>
                            <Separator className="my-4" />
                            <form action={resolveCommentAction}>
                              <input
                                type="hidden"
                                name="projectId"
                                value={project.id}
                              />
                              <input
                                type="hidden"
                                name="commentId"
                                value={comment.id}
                              />
                              <Button variant="outline" size="sm">
                                Resolve
                              </Button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    ))}
                    {version.comments.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-zinc-500">
                        <MessageSquareText
                          className="mx-auto size-8"
                          aria-hidden="true"
                        />
                        <p className="mt-2">No client comments yet.</p>
                      </div>
                    ) : null}
                  </div>

                  {version.approvals.length ? (
                    <div className="space-y-3">
                      <h2 className="text-sm font-medium">Approval history</h2>
                      {version.approvals.map((approval) => (
                        <div
                          key={approval.id}
                          className="rounded-lg bg-zinc-50 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                              {approval.clientName}
                            </span>
                            <StatusBadge status={approval.decision} />
                          </div>
                          {approval.message ? (
                            <p className="mt-2 text-zinc-600">
                              {approval.message}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Revision notes</CardTitle>
          <CardDescription>
            Operational notes for handoff to a production data backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value="The demo store persists project, upload, comment, and approval state locally under .data. The production boundary is isolated behind server/store.ts, server/storage.ts, server/supabase.ts, server/billing.ts, and server/email.ts."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper: string;
}) {
  return (
    <Card>
      <CardContent className="pt-0">
        <p className="text-sm text-zinc-500">{label}</p>
        <div className="mt-2 text-xl font-semibold capitalize">{value}</div>
        <p className="mt-2 text-xs text-zinc-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function FlowItem({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  tone: "teal" | "blue" | "amber" | "emerald";
}) {
  const toneClassName = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-8 items-center justify-center rounded-lg ${toneClassName}`}
      >
        <Icon className="size-4" aria-hidden={true} />
      </div>
      <span className="text-zinc-700">{label}</span>
    </div>
  );
}
