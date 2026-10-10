"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpreadCanvas } from "@/components/proof/spread-canvas";
import { DEMO_ALBUM_ASSETS } from "@/lib/demo-album";

export function SampleAlbumPreview() {
  const [index, setIndex] = useState(1);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const asset = DEMO_ALBUM_ASSETS[index];
  const hasComment = asset.name === "ceremony";
  const body = "Can we swap this ceremony detail for the wider aisle photo?";
  const pins = hasComment ? [{ id: "sample-note", number: 1, x: 0.63, y: 0.42, body }] : [];

  function move(next: number) {
    setIndex(Math.max(0, Math.min(DEMO_ALBUM_ASSETS.length - 1, next)));
    setSelectedPin(null);
  }

  return (
    <div data-product-preview className="overflow-hidden rounded-lg border border-zinc-200 bg-white text-left shadow-[0_12px_48px_rgba(24,24,27,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6">
        <div>
          <p className="text-[11px] text-zinc-500">Evergreen & Gold Studio · Sample album</p>
          <p className="mt-1 text-sm font-medium text-zinc-900">Maya & Liam&apos;s wedding</p>
        </div>
        <Link href="/proof/demo-proof-token" className="flex items-center gap-1.5 text-xs font-medium text-teal-700">
          Open full proof <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 bg-zinc-50 p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
            <span>{asset.title}</span>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous sample spread" title="Previous spread" disabled={index === 0} onClick={() => move(index - 1)}><ChevronLeft className="size-4" aria-hidden /></Button>
              <span aria-live="polite" className="w-12 text-center tabular-nums">{index + 1} / 4</span>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Next sample spread" title="Next spread" disabled={index === 3} onClick={() => move(index + 1)}><ChevronRight className="size-4" aria-hidden /></Button>
            </div>
          </div>
          <SpreadCanvas key={asset.src} src={asset.src} alt={"Sample wedding album: " + asset.title} width={asset.width} height={asset.height} priority pins={pins} selectedPin={selectedPin} onSelectPin={setSelectedPin} />
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Sample wedding spreads">
            {DEMO_ALBUM_ASSETS.map((sample, sampleIndex) => (
              <button type="button" key={sample.name} aria-label={"Preview " + sample.title + " spread"} aria-pressed={sampleIndex === index} onClick={() => move(sampleIndex)} className={"w-24 shrink-0 rounded border bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 " + (sampleIndex === index ? "border-teal-700" : "border-zinc-200 hover:border-zinc-400")}>
                <Image src={sample.thumbnailSrc} alt="" width={sample.width} height={sample.height} unoptimized className="h-10 w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
        <aside className="min-w-0 border-t border-zinc-200 px-5 py-6 md:border-t-0 md:border-l">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">Feedback</p>
            <span className="text-[11px] text-zinc-400">Version 1</span>
          </div>
          {hasComment ? (
            <div className={"mt-6 rounded-md p-2 -mx-2 " + (selectedPin ? "bg-teal-50 ring-1 ring-teal-200" : "")}>
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-medium text-zinc-800">1</span>
                <span className="text-xs font-medium">Maya Harper</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{body}</p>
              <p className="mt-3 text-[11px] text-zinc-400">Sample client note · Open</p>
            </div>
          ) : <p className="mt-6 text-sm leading-6 text-zinc-400">No comments on this spread.</p>}
          <Link href="/proof/demo-proof-token" className="mt-8 flex items-center gap-2 text-xs font-medium text-teal-700">
            <MessageSquareText className="size-3.5" aria-hidden /> Review sample album
          </Link>
        </aside>
      </div>
      <p className="border-t border-zinc-200 px-4 py-2.5 text-[11px] leading-5 text-zinc-400 sm:px-6">Fictional wedding · Generated sample imagery.</p>
    </div>
  );
}
