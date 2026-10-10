"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Check, CheckCircle2, ChevronLeft, ChevronRight, Maximize2,
  MessageSquarePlus, Minimize2, Minus, Plus, Scan, X,
} from "lucide-react";
import { addProofCommentAction, submitProofDecisionAction } from "@/app/actions/proof";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpreadCanvas, type SpreadPin, type CanvasComment } from "./spread-canvas";
import { getDemoAlbumAsset } from "@/lib/demo-album";
import { formatDateTime } from "@/lib/format";
import type { ApprovalDecision, ProofSession } from "@/server/types";

type ProofViewerProps = {
  proof: ProofSession;
  token: string;
  defaultName: string;
  defaultEmail: string;
  submitted?: string;
};

export function ProofViewer({ proof, token, defaultName, defaultEmail, submitted }: ProofViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullScreen, setFullScreen] = useState(false);
  const [draftPin, setDraftPin] = useState<SpreadPin | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [fallbackIdentity, setFallbackIdentity] = useState({ name: defaultName, email: defaultEmail });
  const [decision, setDecision] = useState<ApprovalDecision>("approved");
  const [decisionOpen, setDecisionOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const identityKey = "album-approve.reviewer." + proof.project.id;
  const storedIdentity = useSyncExternalStore(
    subscribeReviewerIdentity,
    () => { try { return localStorage.getItem(identityKey); } catch { return null; } },
    () => null,
  );
  const { name: clientName, email: clientEmail } = parseReviewerIdentity(storedIdentity, fallbackIdentity);

  const activeSpread = proof.spreads[activeIndex] || proof.spreads[0];
  const activeComments = proof.comments
    .filter((comment) => comment.spreadId === activeSpread?.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const pins: CanvasComment[] = activeComments.flatMap((comment, index) =>
    comment.x !== undefined && comment.y !== undefined
      ? [{
          id: comment.id, number: index + 1, body: comment.body,
          x: comment.x, y: comment.y, resolved: Boolean(comment.resolvedAt),
        }]
      : [],
  );
  const unresolvedCount = proof.comments.filter((comment) => !comment.resolvedAt).length;
  const isSampleAlbum = proof.spreads.some((spread) => getDemoAlbumAsset(spread.storageKey));

  function changeIdentity(name: string, email: string) {
    setFallbackIdentity({ name, email });
    try {
      localStorage.setItem(identityKey, JSON.stringify({ name, email }));
      window.dispatchEvent(new Event("album-approve:reviewer"));
    } catch {}
  }

  useEffect(() => {
    function restoreSpread() {
      const id = window.location.hash.replace("#spread-", "");
      const index = proof.spreads.findIndex((spread) => spread.id === id);
      if (index >= 0) {
        setActiveIndex(index);
        setDraftPin(null);
        setComposerOpen(false);
      }
    }
    restoreSpread();
    window.addEventListener("hashchange", restoreSpread);
    return () => window.removeEventListener("hashchange", restoreSpread);
  }, [proof.spreads]);

  useEffect(() => {
    if (composerOpen && !fullScreen) composerRef.current?.focus();
  }, [composerOpen, fullScreen, draftPin]);

  useEffect(() => {
    if (selectedComment) {
      document.getElementById("comment-" + selectedComment)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedComment]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (decisionOpen || event.altKey || event.ctrlKey || event.metaKey ||
          target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, Math.min(proof.spreads.length - 1, index + (event.key === "ArrowRight" ? 1 : -1))));
        setDraftPin(null);
        setComposerOpen(false);
        setSelectedComment(null);
        setZoom(1);
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((value) => Math.min(3, value + 0.25));
      }
      if (event.key === "-") {
        event.preventDefault();
        setZoom((value) => Math.max(1, value - 0.25));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [decisionOpen, proof.spreads.length]);

  function moveSpread(index: number) {
    setActiveIndex(Math.max(0, Math.min(proof.spreads.length - 1, index)));
    setDraftPin(null);
    setComposerOpen(false);
    setSelectedComment(null);
    setZoom(1);
  }

  function placePin(pin: SpreadPin) {
    setDraftPin(pin);
    setSelectedComment(null);
    setComposerOpen(true);
    setFullScreen(false);
  }

  function finishReview(nextDecision: ApprovalDecision) {
    setDecision(nextDecision);
    setDecisionOpen(true);
  }

  if (!activeSpread) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-md text-center">
          <p className="text-sm text-zinc-500">{proof.studio.name}</p>
          <h1 className="mt-3 break-words text-2xl font-semibold">{proof.project.title}</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">The studio has not added any spreads to this version yet. Contact your photographer for an updated proof.</p>
        </div>
      </main>
    );
  }

  const albumSurface = (
    <AlbumSurface
      spread={activeSpread}
      projectTitle={proof.project.title}
      index={activeIndex}
      count={proof.spreads.length}
      zoom={zoom}
      fullScreen={fullScreen}
      pins={pins}
      draftPin={draftPin}
      selectedPin={selectedComment}
      onPlacePin={placePin}
      onSelectPin={(id) => { setSelectedComment(id); setFullScreen(false); }}
      onMove={moveSpread}
      onZoom={setZoom}
      onFullScreen={() => { setZoom(1); setFullScreen((value) => !value); }}
    />
  );

  return (
    <main data-proof-root className="min-h-screen bg-white text-zinc-950">
      {isSampleAlbum ? (
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-center text-xs leading-5 text-zinc-500">
          Generated sample wedding album. Public preview: use sample files only.
        </div>
      ) : null}
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-[1720px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500">{proof.studio.name}</p>
            <h1 className="mt-1 break-words text-xl font-medium">{proof.project.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
            <span>Version {proof.version.versionNumber}</span>
            <StatusBadge status={proof.version.status} />
          </div>
        </div>
      </header>

      {submitted === "approved" || submitted === "changes_requested" ? (
        <div role="status" className="border-b border-teal-100 bg-teal-50 px-4 py-3 text-center text-sm text-teal-900">
          {submitted === "approved" ? "Your approval was recorded" : "Your change request was recorded"} for version {proof.version.versionNumber}.
        </div>
      ) : null}

      <div data-proof-workspace className="mx-auto grid max-w-[1720px] lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Album spreads" className="min-w-0 bg-zinc-50 p-3 sm:p-6">
          {!fullScreen ? albumSurface : <div className="h-[min(62svh,620px)]" />}
          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>{proof.spreads.length} spreads</span>
            <span>{activeComments.length} comments on this spread</span>
          </div>
          <div aria-label="Choose a spread" className="mt-3 flex gap-3 overflow-x-auto pb-3">
            {proof.spreads.map((spread, index) => {
              const sample = getDemoAlbumAsset(spread.storageKey);
              const count = proof.comments.filter((comment) => comment.spreadId === spread.id).length;
              return (
                <button
                  key={spread.id}
                  type="button"
                  aria-label={"View spread " + (index + 1) + (sample ? ": " + sample.title : "")}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={
                    "w-28 shrink-0 rounded-md border p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 " +
                    (index === activeIndex ? "border-teal-700 bg-white" : "border-zinc-200 bg-white/60 hover:border-zinc-400")
                  }
                  onClick={() => moveSpread(index)}
                >
                  <Image src={spread.thumbnailUrl} alt="" width={spread.width || 1400} height={spread.height || 900} unoptimized className="h-14 w-full object-contain" />
                  <span className="mt-1.5 flex justify-between gap-2 text-[11px] text-zinc-500">
                    <span>{index + 1}{sample ? " · " + sample.title : ""}</span>
                    {count ? <span aria-label={count + " comments"}>{count}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside aria-label="Album feedback" className="min-w-0 border-t border-zinc-200 lg:border-t-0 lg:border-l">
          <section className="border-b border-zinc-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Feedback</h2>
              <span className="text-xs text-zinc-500">Spread {activeIndex + 1}</span>
            </div>
            <p className="mt-2 break-words text-xs text-zinc-500">Reviewing as {clientName || "guest"}</p>
            {!composerOpen ? (
              <Button variant="outline" className="mt-4 w-full" onClick={() => { setDraftPin(null); setComposerOpen(true); }}>
                <MessageSquarePlus className="size-4" aria-hidden /> Add comment
              </Button>
            ) : null}

            {composerOpen ? (
              <form action={addProofCommentAction} key={activeSpread.id} className="mt-4 space-y-3">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="spreadId" value={activeSpread.id} />
                {draftPin ? <><input type="hidden" name="x" value={draftPin.x} /><input type="hidden" name="y" value={draftPin.y} /></> : null}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="comment-body">{draftPin ? "Pinned comment" : "Spread comment"}</Label>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Cancel comment" title="Cancel comment" onClick={() => { setComposerOpen(false); setDraftPin(null); }}>
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
                <Textarea ref={composerRef} id="comment-body" name="body" required minLength={2} maxLength={1200} rows={3} placeholder="What would you like changed?" />
                {draftPin ? <button type="button" className="text-xs text-zinc-500 underline underline-offset-4" onClick={() => setDraftPin(null)}>Remove location pin</button> : null}
                <ReviewerFields prefix="comment" nameField="authorName" emailField="authorEmail" name={clientName} email={clientEmail} onChange={changeIdentity} />
                <SubmitButton pendingLabel="Saving comment..."><MessageSquarePlus className="size-4" aria-hidden /> Save comment</SubmitButton>
              </form>
            ) : null}
          </section>

          <section data-comment-list className="max-h-[440px] overflow-y-auto p-5 lg:max-h-[min(45svh,440px)]">
            {activeComments.length ? (
              <ol className="space-y-5">
                {activeComments.map((comment, index) => (
                  <li key={comment.id} id={"comment-" + comment.id} tabIndex={-1} className={"rounded-md p-2 -mx-2 " + (selectedComment === comment.id ? "bg-teal-50 ring-1 ring-teal-200" : "")}>
                    <div className="flex items-start gap-2">
                      {comment.x !== undefined && comment.y !== undefined ? (
                        <button type="button" title="Select this comment pin" aria-label={"Select comment " + (index + 1)} className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium" onClick={() => setSelectedComment(comment.id)}>{index + 1}</button>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-xs font-medium">{comment.authorName}</p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">{formatDateTime(comment.createdAt)}</p>
                      </div>
                      {comment.resolvedAt ? <Check className="size-3.5 shrink-0 text-teal-700" aria-label="Resolved" /> : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-600">{comment.body}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="py-4 text-sm leading-6 text-zinc-400">No comments on this spread.</p>}
          </section>

          <section data-review-decision className="border-t border-zinc-200 p-5">
            <h2 className="text-sm font-semibold">Finish your review</h2>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Your decision is recorded against version {proof.version.versionNumber}. {unresolvedCount} open {unresolvedCount === 1 ? "comment" : "comments"} across this album.</p>
            <Button className="mt-4 w-full" onClick={() => finishReview("approved")}><CheckCircle2 className="size-4" aria-hidden /> Approve album</Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => finishReview("changes_requested")}>Request changes</Button>
          </section>
        </aside>
      </div>

      <Dialog open={fullScreen} onOpenChange={(open) => { setFullScreen(open); setZoom(1); }}>
        <DialogContent showCloseButton={false} onCloseAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => {
            if (composerOpen) composerRef.current?.focus();
            else if (selectedComment) document.getElementById("comment-" + selectedComment)?.focus();
            else document.querySelector<HTMLButtonElement>('[data-proof-root] button[aria-label="Full screen"]')?.focus();
          });
        }} className="inset-0 top-0 left-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-zinc-50 p-3 sm:max-w-none sm:p-6">
          <DialogTitle className="sr-only">{proof.project.title} full screen</DialogTitle>
          <DialogDescription className="sr-only">Album spread detail view.</DialogDescription>
          {albumSurface}
        </DialogContent>
      </Dialog>

      <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-lg sm:max-w-md">
          <DialogTitle>{decision === "approved" ? "Approve this album?" : "Request album changes"}</DialogTitle>
          <DialogDescription>
            This decision applies to version {proof.version.versionNumber}.
            {unresolvedCount ? " There are " + unresolvedCount + " open comments." : ""}
          </DialogDescription>
          <form action={submitProofDecisionAction} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="decision" value={decision} />
            <ReviewerFields prefix="decision" nameField="clientName" emailField="clientEmail" name={clientName} email={clientEmail} onChange={changeIdentity} />
            <div className="space-y-2">
              <Label htmlFor="decision-message">{decision === "approved" ? "Approval note (optional)" : "What needs to change?"}</Label>
              <Textarea id="decision-message" name="message" maxLength={1200} required={decision === "changes_requested"} rows={3} />
            </div>
            {decision === "approved" ? <label className="flex items-start gap-2 text-sm leading-6 text-zinc-600"><input type="checkbox" required className="mt-1.5 accent-teal-700" /> I approve version {proof.version.versionNumber} for production.</label> : null}
            <SubmitButton pendingLabel="Recording decision...">{decision === "approved" ? "Confirm approval" : "Send change request"}</SubmitButton>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ReviewerFields({ prefix, nameField, emailField, name, email, onChange }: {
  prefix: string; nameField: string; emailField: string; name: string; email: string;
  onChange: (name: string, email: string) => void;
}) {
  return (
    <div className="grid gap-3">
      <div className="space-y-1.5">
        <Label htmlFor={prefix + "-name"}>Your name</Label>
        <Input id={prefix + "-name"} name={nameField} autoComplete="name" value={name} required minLength={2} maxLength={100} onChange={(event) => onChange(event.target.value, email)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={prefix + "-email"}>Email</Label>
        <Input id={prefix + "-email"} name={emailField} autoComplete="email" type="email" value={email} required maxLength={254} onChange={(event) => onChange(name, event.target.value)} />
      </div>
    </div>
  );
}

function SubmitButton({ pendingLabel, children }: { pendingLabel: string; children: ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? pendingLabel : children}</Button>;
}

function AlbumSurface({ spread, projectTitle, index, count, zoom, fullScreen, pins, draftPin, selectedPin, onPlacePin, onSelectPin, onMove, onZoom, onFullScreen }: {
  spread: ProofSession["spreads"][number]; projectTitle: string; index: number; count: number;
  zoom: number; fullScreen: boolean; pins: CanvasComment[]; draftPin: SpreadPin | null;
  selectedPin: string | null; onPlacePin: (pin: SpreadPin) => void; onSelectPin: (id: string) => void;
  onMove: (index: number) => void; onZoom: (zoom: number) => void; onFullScreen: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const width = spread.width || 1400;
  const height = spread.height || 900;
  const ratio = width / height;
  const fitWidth = bounds.width ? Math.min(bounds.width, bounds.height * ratio) : 0;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      setBounds({ width: Math.max(1, viewport.clientWidth - 32), height: Math.max(1, viewport.clientHeight - 32) });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={fullScreen ? "flex min-h-0 flex-1 flex-col" : "min-w-0"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Previous spread" title="Previous spread" disabled={index === 0} onClick={() => onMove(index - 1)}><ChevronLeft className="size-4" aria-hidden /></Button>
          <span aria-live="polite" className="min-w-20 text-center text-xs tabular-nums text-zinc-500">{index + 1} / {count}</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Next spread" title="Next spread" disabled={index === count - 1} onClick={() => onMove(index + 1)}><ChevronRight className="size-4" aria-hidden /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 1} onClick={() => onZoom(Math.max(1, zoom - 0.25))}><Minus className="size-4" aria-hidden /></Button>
          <span className="w-10 text-center text-xs tabular-nums text-zinc-500">{Math.round(zoom * 100)}%</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 3} onClick={() => onZoom(Math.min(3, zoom + 0.25))}><Plus className="size-4" aria-hidden /></Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Fit spread" title="Fit spread" onClick={() => onZoom(1)}><Scan className="size-4" aria-hidden /></Button>
          <Button type="button" variant="ghost" size="icon" aria-label={fullScreen ? "Exit full screen" : "Full screen"} title={fullScreen ? "Exit full screen" : "Full screen"} onClick={onFullScreen}>{fullScreen ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}</Button>
        </div>
      </div>
      <div
        ref={viewportRef}
        data-album-viewport
        className={"overflow-auto bg-zinc-100/80 p-4 " + (fullScreen ? "min-h-0 flex-1" : "h-[280px] sm:h-[min(62svh,620px)]")}
      >
        <div style={{
          width: fitWidth ? fitWidth * zoom : "100%",
          marginInline: "auto",
          marginBlock: fitWidth ? Math.max(0, (bounds.height - fitWidth / ratio * zoom) / 2) : 0,
        }}>
          <SpreadCanvas
            key={spread.id + spread.signedUrl}
            src={spread.signedUrl}
            alt={projectTitle + " spread " + (index + 1)}
            width={width} height={height} priority
            pins={pins} draftPin={draftPin} selectedPin={selectedPin}
            onPlacePin={onPlacePin} onSelectPin={onSelectPin}
          />
        </div>
      </div>
    </div>
  );
}

function subscribeReviewerIdentity(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("album-approve:reviewer", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("album-approve:reviewer", listener);
  };
}

function parseReviewerIdentity(serialized: string | null, fallback: { name: string; email: string }) {
  try {
    const saved = JSON.parse(serialized || "null");
    if (typeof saved?.name === "string" && typeof saved?.email === "string") return saved;
  } catch {}
  return fallback;
}
