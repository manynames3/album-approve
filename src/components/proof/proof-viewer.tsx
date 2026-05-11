"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquarePlus,
  Minus,
  Plus,
  XCircle,
} from "lucide-react";
import {
  addProofCommentAction,
  submitProofDecisionAction,
} from "@/app/actions/proof";
import { StatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import type { ProofSession } from "@/server/types";

type ProofViewerProps = {
  proof: ProofSession;
  token: string;
  defaultName: string;
  defaultEmail: string;
  submitted?: string;
};

type Pin = { x: number; y: number };

export function ProofViewer({
  proof,
  token,
  defaultName,
  defaultEmail,
  submitted,
}: ProofViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFocusedView, setIsFocusedView] = useState(false);
  const [draftPin, setDraftPin] = useState<Pin | null>(null);
  const [clientName, setClientName] = useState(() =>
    typeof window === "undefined"
      ? defaultName
      : window.localStorage.getItem("proofalbum.clientName") || defaultName,
  );
  const [clientEmail, setClientEmail] = useState(() =>
    typeof window === "undefined"
      ? defaultEmail
      : window.localStorage.getItem("proofalbum.clientEmail") || defaultEmail,
  );
  const [decision, setDecision] = useState<"approved" | "changes_requested">(
    "approved",
  );

  const activeSpread = proof.spreads[activeIndex] || proof.spreads[0];
  const activeComments = proof.comments
    .filter((comment) => comment.spreadId === activeSpread?.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const unresolvedCount = proof.comments.filter(
    (comment) => !comment.resolvedAt,
  ).length;
  const progressLabel = `${activeIndex + 1} of ${proof.spreads.length}`;

  useEffect(() => {
    window.localStorage.setItem("proofalbum.clientName", clientName);
  }, [clientName]);

  useEffect(() => {
    window.localStorage.setItem("proofalbum.clientEmail", clientEmail);
  }, [clientEmail]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) =>
          Math.min(index + 1, proof.spreads.length - 1),
        );
        setDraftPin(null);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        setDraftPin(null);
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((value) => Math.min(value + 0.1, 1.8));
      }

      if (event.key === "-") {
        event.preventDefault();
        setZoom((value) => Math.max(value - 0.1, 0.7));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [proof.spreads.length]);

  function moveActiveSpread(nextIndex: number) {
    setActiveIndex(Math.max(0, Math.min(nextIndex, proof.spreads.length - 1)));
    setDraftPin(null);
  }

  function handleImageClick(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setDraftPin({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  }

  return (
    <main
      className={
        isFocusedView
          ? "fixed inset-0 z-50 overflow-auto bg-zinc-950 text-white"
          : "min-h-screen bg-zinc-100"
      }
    >
      <header
        className={
          isFocusedView
            ? "sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur"
            : "sticky top-0 z-20 border-b bg-white/90 backdrop-blur"
        }
        style={{
          borderColor: isFocusedView
            ? undefined
            : proof.studio.brandColor || "#0f766e",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p
              className={
                isFocusedView
                  ? "text-sm font-medium text-teal-200"
                  : "text-sm font-medium text-teal-700"
              }
            >
              {proof.studio.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {proof.project.title}
            </h1>
            <p
              className={
                isFocusedView
                  ? "mt-1 text-sm text-zinc-300"
                  : "mt-1 text-sm text-zinc-600"
              }
            >
              Version {proof.version.versionNumber} · {proof.spreads.length}{" "}
              spreads
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={
                isFocusedView
                  ? "border-white/20 bg-white/10 text-white"
                  : "bg-zinc-50 text-zinc-700"
              }
            >
              Flipbook {progressLabel}
            </Badge>
            <Badge
              variant="outline"
              className={
                unresolvedCount
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            >
              {unresolvedCount} open
            </Badge>
            <StatusBadge status={proof.version.status} />
            <Button
              type="button"
              variant={isFocusedView ? "secondary" : "outline"}
              className="gap-2"
              onClick={() => setIsFocusedView((value) => !value)}
            >
              <Maximize2 className="size-4" aria-hidden="true" />
              {isFocusedView ? "Exit focus" : "Focus view"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-4">
          {submitted ? (
            <Card className="border-teal-200 bg-teal-50 text-teal-950">
              <CardContent className="pt-0 text-sm">
                Decision submitted: {submitted.replaceAll("_", " ")}.
              </CardContent>
            </Card>
          ) : null}

          <Card
            className={
              isFocusedView
                ? "border-white/10 bg-zinc-900 text-white"
                : "bg-white"
            }
          >
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>
                      Spread {activeIndex + 1}: {activeSpread.filename}
                    </CardTitle>
                    {activeComments.length ? (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700"
                      >
                        {activeComments.length} comments
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription
                    className={isFocusedView ? "text-zinc-300" : undefined}
                  >
                    Click the image to place a pin before adding a comment.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Previous spread"
                    onClick={() => moveActiveSpread(activeIndex - 1)}
                    disabled={activeIndex === 0}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Zoom out"
                    onClick={() =>
                      setZoom((value) => Math.max(value - 0.1, 0.7))
                    }
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </Button>
                  <div className="flex h-8 min-w-16 items-center justify-center rounded-lg border px-2 text-sm">
                    {Math.round(zoom * 100)}%
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Zoom in"
                    onClick={() =>
                      setZoom((value) => Math.min(value + 0.1, 1.8))
                    }
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Next spread"
                    onClick={() => moveActiveSpread(activeIndex + 1)}
                    disabled={activeIndex === proof.spreads.length - 1}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div
                className={
                  isFocusedView
                    ? "overflow-auto rounded-lg border border-white/10 bg-zinc-950 p-3"
                    : "overflow-auto rounded-lg border bg-zinc-950 p-3"
                }
              >
                <button
                  type="button"
                  aria-label={`Set comment pin on spread ${activeIndex + 1}`}
                  className="relative block w-full cursor-crosshair overflow-hidden rounded-md bg-white text-left shadow-2xl shadow-black/25"
                  onClick={handleImageClick}
                  style={{
                    width: `${zoom * 100}%`,
                    marginInline: "auto",
                  }}
                >
                  <Image
                    src={activeSpread.signedUrl}
                    alt={`${proof.project.title} spread ${activeIndex + 1}`}
                    width={activeSpread.width || 1400}
                    height={activeSpread.height || 900}
                    unoptimized
                    priority
                    className="aspect-[14/9] w-full object-cover"
                  />
                  {activeComments
                    .filter(
                      (comment) =>
                        comment.x !== undefined && comment.y !== undefined,
                    )
                    .map((comment, index) => (
                      <span
                        key={comment.id}
                        className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-zinc-950 ring-2 ring-white"
                        style={{
                          left: `${(comment.x || 0) * 100}%`,
                          top: `${(comment.y || 0) * 100}%`,
                        }}
                      >
                        {index + 1}
                      </span>
                    ))}
                  {draftPin ? (
                    <span
                      className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white ring-2 ring-white"
                      style={{
                        left: `${draftPin.x * 100}%`,
                        top: `${draftPin.y * 100}%`,
                      }}
                    >
                      New
                    </span>
                  ) : null}
                </button>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p
                className={
                  isFocusedView
                    ? "text-sm font-medium text-zinc-200"
                    : "text-sm font-medium text-zinc-700"
                }
              >
                Flip-through queue
              </p>
              <p
                className={
                  isFocusedView
                    ? "text-xs text-zinc-400"
                    : "text-xs text-zinc-500"
                }
              >
                Arrow keys move between spreads
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {proof.spreads.map((spread, index) => {
                const count = proof.comments.filter(
                  (comment) => comment.spreadId === spread.id,
                ).length;

                return (
                  <button
                    key={spread.id}
                    type="button"
                    aria-label={`Spread ${index + 1}, ${count} comment${
                      count === 1 ? "" : "s"
                    }`}
                    className={`rounded-lg border p-2 text-left text-sm transition ${
                      index === activeIndex
                        ? "border-teal-600 bg-teal-50 shadow-sm"
                        : isFocusedView
                          ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                          : "bg-white hover:bg-zinc-50"
                    }`}
                    onClick={() => moveActiveSpread(index)}
                  >
                    <Image
                      src={spread.thumbnailUrl}
                      alt=""
                      width={240}
                      height={154}
                      unoptimized
                      className="aspect-[14/9] w-full rounded-md object-cover"
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="truncate font-medium">
                        Spread {index + 1}
                      </span>
                      <span
                        className={
                          isFocusedView
                            ? "text-xs text-zinc-300"
                            : "text-xs text-zinc-500"
                        }
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-6 md:sticky md:top-6 md:self-start">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Client details</CardTitle>
                <Badge variant="outline" className="bg-zinc-50 text-zinc-700">
                  Saved
                </Badge>
              </div>
              <CardDescription>
                Saved in this browser for all comments and decisions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="proof-client-name">Name</Label>
                <Input
                  id="proof-client-name"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proof-client-email">Email</Label>
                <Input
                  id="proof-client-email"
                  value={clientEmail}
                  type="email"
                  onChange={(event) => setClientEmail(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Add comment</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    draftPin
                      ? "border-teal-200 bg-teal-50 text-teal-800"
                      : "bg-zinc-50 text-zinc-700"
                  }
                >
                  {draftPin ? "Pinned" : "Optional pin"}
                </Badge>
              </div>
              <CardDescription>
                {draftPin
                  ? `Pinned at ${Math.round(draftPin.x * 100)}%, ${Math.round(
                      draftPin.y * 100,
                    )}%`
                  : "Click the spread to add an optional pin."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addProofCommentAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="spreadId" value={activeSpread.id} />
                <input type="hidden" name="authorName" value={clientName} />
                <input type="hidden" name="authorEmail" value={clientEmail} />
                {draftPin ? (
                  <>
                    <input type="hidden" name="x" value={draftPin.x} />
                    <input type="hidden" name="y" value={draftPin.y} />
                  </>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="comment-body">Comment</Label>
                  <Textarea
                    id="comment-body"
                    name="body"
                    placeholder="Add a spread-specific note"
                    required
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  disabled={!clientName || !clientEmail}
                >
                  <MessageSquarePlus className="size-4" aria-hidden="true" />
                  Add comment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Submit decision</CardTitle>
                <Badge variant="outline" className="bg-zinc-50 text-zinc-700">
                  v{proof.version.versionNumber}
                </Badge>
              </div>
              <CardDescription>
                Approval is timestamped and retained separately from comments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-2 rounded-lg border bg-zinc-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span>Version</span>
                  <span className="font-medium">
                    v{proof.version.versionNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Unresolved comments</span>
                  <span className="font-medium">{unresolvedCount}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Spreads reviewed</span>
                  <span className="font-medium">{proof.spreads.length}</span>
                </div>
              </div>
              <form action={submitProofDecisionAction} className="space-y-4">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="clientName" value={clientName} />
                <input type="hidden" name="clientEmail" value={clientEmail} />
                <div className="space-y-2">
                  <Label htmlFor="decision-message">Message</Label>
                  <Textarea
                    id="decision-message"
                    name="message"
                    required={decision === "changes_requested"}
                    placeholder={
                      decision === "changes_requested"
                        ? "Describe what needs to change"
                        : "Optional approval note"
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Button
                    type="submit"
                    name="decision"
                    value="approved"
                    className="gap-2"
                    onClick={() => setDecision("approved")}
                    disabled={!clientName || !clientEmail}
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Approve album
                  </Button>
                  <Button
                    type="submit"
                    name="decision"
                    value="changes_requested"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setDecision("changes_requested")}
                    disabled={!clientName || !clientEmail}
                  >
                    <XCircle className="size-4" aria-hidden="true" />
                    Request changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>
                Notes on spread {activeIndex + 1}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeComments.length ? (
                activeComments.map((comment, index) => (
                  <div key={comment.id} className="rounded-lg bg-zinc-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {comment.x !== undefined && comment.y !== undefined
                          ? `${index + 1}. `
                          : ""}
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-zinc-700">{comment.body}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-zinc-500">
                  No comments on this spread yet.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
