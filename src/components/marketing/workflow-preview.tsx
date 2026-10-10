"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  MessageSquareText,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import demo from "@/lib/workflow-demo-assets.json";

const steps = [
  {
    id: "upload",
    label: "Upload",
    icon: FileUp,
    title: "Your design. Ready for review.",
    description:
      "Add exported JPG or PNG spreads to a client album. Keep the design work in the tools you already use.",
    href: "/sign-up",
    cta: "Try the studio workspace",
  },
  {
    id: "feedback",
    label: "Comment",
    icon: MessageSquareText,
    title: "Know exactly what needs changing.",
    description:
      "Send one link. Clients flip through the album and pin notes to the spread, without creating an account.",
    href: "/proof/demo-proof-token",
    cta: "Try leaving a comment",
  },
  {
    id: "approval",
    label: "Approve",
    icon: CheckCircle2,
    title: "A clear decision before print.",
    description:
      "After feedback is resolved, clients confirm the album version they are approving. The decision stays with that version.",
    href: "/proof/demo-proof-token",
    cta: "Explore the client proof",
  },
];

function allowAutoplay() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !(navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData
  );
}

export function WorkflowPreview() {
  const asset = demo.desktop;
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const manualPause = useRef(false);
  const wanted = useRef(false);
  const pendingSeek = useRef<number | null>(null);
  const step = steps[active];

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          video.current?.pause();
          return;
        }
        if (allowAutoplay() && !manualPause.current) {
          wanted.current = true;
          setEnabled(true);
          if (video.current?.readyState)
            void video.current.play().catch(() => {});
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    function motionChanged() {
      if (!allowAutoplay()) {
        wanted.current = false;
        video.current?.pause();
      }
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", motionChanged);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", motionChanged);
    };
  }, []);

  function play() {
    wanted.current = true;
    manualPause.current = false;
    setFailed(false);
    setEnabled(true);
    if (failed) video.current?.load();
    if (video.current?.readyState) void video.current.play().catch(() => {});
  }

  function seek(index: number) {
    const time = asset.chapters[index].start;
    setActive(index);
    pendingSeek.current = time;
    if (video.current?.readyState) {
      video.current.currentTime = time;
      pendingSeek.current = null;
    }
    play();
  }

  return (
    <Tabs
      value={step.id}
      onValueChange={(id) => seek(steps.findIndex((item) => item.id === id))}
      className="mt-10 gap-6"
      data-workflow-preview
    >
      <TabsList
        aria-label="Album proofing workflow"
        className="mx-auto grid w-full max-w-md grid-cols-3 bg-zinc-100 group-data-horizontal/tabs:h-12"
      >
        {steps.map((item, index) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            aria-label={`${index + 1}. ${item.label}`}
            className="gap-1 text-xs sm:gap-2 sm:text-sm"
          >
            <item.icon className="size-4" aria-hidden />
            <span>
              <span className="hidden sm:inline">{index + 1}. </span>
              {item.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={step.id} className="space-y-6">
        <div className="mx-auto min-h-24 max-w-xl text-center">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {step.description}
          </p>
        </div>
        <figure className="mx-auto max-w-5xl">
          <div
            ref={frame}
            className="relative aspect-[1440/1000] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 shadow-[0_12px_40px_rgba(24,24,27,0.06)]"
          >
            {!enabled || failed ? (
              <>
                <Image
                  src={asset.poster}
                  alt="Wedding album spreads ready to upload in the studio workspace"
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 100vw, 1024px"
                  className="object-contain"
                />
                {!failed ? (
                  <Button
                    size="icon"
                    onClick={play}
                    aria-label="Play workflow demo"
                    title="Play workflow demo"
                    className="absolute bottom-6 left-1/2 size-14 -translate-x-1/2 rounded-full bg-teal-700 shadow-lg hover:bg-teal-800"
                  >
                    <Play className="size-6" aria-hidden />
                  </Button>
                ) : null}
              </>
            ) : null}
            <video
              ref={video}
              src={enabled ? asset.src : undefined}
              poster={asset.poster}
              width={asset.width}
              height={asset.height}
              controls
              muted
              loop
              playsInline
              preload={enabled ? "metadata" : "none"}
              aria-label="Album proofing workflow demonstration"
              aria-describedby="workflow-transcript"
              className={`h-full w-full object-contain ${!enabled || failed ? "invisible" : ""}`}
              onLoadedMetadata={() => {
                if (pendingSeek.current !== null && video.current) {
                  video.current.currentTime = pendingSeek.current;
                  pendingSeek.current = null;
                }
                if (wanted.current && visible.current)
                  void video.current?.play().catch(() => {});
              }}
              onPlay={() => {
                setPlaying(true);
                manualPause.current = false;
              }}
              onPause={() => {
                setPlaying(false);
                if (visible.current) {
                  manualPause.current = true;
                  wanted.current = false;
                }
              }}
              onTimeUpdate={(event) => {
                const time = event.currentTarget.currentTime;
                setActive(
                  time >= asset.chapters[2].start
                    ? 2
                    : time >= asset.chapters[1].start
                      ? 1
                      : 0,
                );
              }}
              onError={() => {
                setFailed(true);
                setPlaying(false);
              }}
            >
              <track
                kind="captions"
                src={asset.captions}
                srcLang="en"
                label="English"
              />
            </video>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>
              Upload to approval &middot; {Math.round(asset.duration)} seconds
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                title={playing ? "Pause demo" : "Play demo"}
                aria-label={playing ? "Pause demo" : "Play demo"}
                onClick={() => {
                  if (playing) {
                    wanted.current = false;
                    manualPause.current = true;
                    video.current?.pause();
                  } else play();
                }}
              >
                {playing ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                title="Replay demo"
                aria-label="Replay demo"
                onClick={() => seek(0)}
              >
                <RotateCcw className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
          <p id="workflow-transcript" className="sr-only">
            Silent recording: the studio uploads four wedding album spreads. A
            client pins a note to the ceremony spread and saves it. After the
            studio resolves the note, the client confirms approval of version
            one and sees the saved approval confirmation.
          </p>
          {failed ? (
            <p role="status" className="mt-3 text-center text-sm text-zinc-600">
              The video could not load. You can still explore the interactive
              proof below.
            </p>
          ) : null}
          <figcaption className="mt-4 text-center">
            <Link
              href={failed ? "/proof/demo-proof-token" : step.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              {failed ? "View demo proof" : step.cta}{" "}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </figcaption>
        </figure>
      </TabsContent>
    </Tabs>
  );
}
