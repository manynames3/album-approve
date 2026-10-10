"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SpreadPin = { x: number; y: number };
export type CanvasComment = SpreadPin & {
  id: string;
  number: number;
  body: string;
  resolved?: boolean;
};

type SpreadCanvasProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  pins?: CanvasComment[];
  draftPin?: SpreadPin | null;
  selectedPin?: string | null;
  onPlacePin?: (pin: SpreadPin) => void;
  onSelectPin?: (id: string) => void;
};

export function SpreadCanvas({
  src,
  alt,
  width,
  height,
  priority = false,
  pins = [],
  draftPin,
  selectedPin,
  onPlacePin,
  onSelectPin,
}: SpreadCanvasProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  function placePin(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    onPlacePin?.(
      event.detail === 0
        ? { x: 0.5, y: 0.5 }
        : {
            x: Math.max(
              0,
              Math.min(1, (event.clientX - rect.left) / rect.width),
            ),
            y: Math.max(
              0,
              Math.min(1, (event.clientY - rect.top) / rect.height),
            ),
          },
    );
  }

  return (
    <div
      data-spread-canvas
      className="relative w-full bg-white shadow-[0_12px_38px_rgba(24,24,27,0.09)]"
      style={{ aspectRatio: width / height }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        priority={priority}
        draggable={false}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
        className="block h-auto w-full select-none"
      />
      {status === "loading" ? (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-zinc-50"
        >
          <Loader2 className="size-5 animate-spin text-zinc-400" aria-hidden />
          <span className="sr-only">Loading album spread</span>
        </div>
      ) : null}
      {status === "error" ? (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-50 p-4 text-center"
        >
          <ImageOff className="size-6 text-zinc-400" aria-hidden />
          <p className="text-sm text-zinc-600">
            This spread could not be loaded.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload proof
          </Button>
        </div>
      ) : null}
      {status === "ready" && onPlacePin ? (
        <button
          type="button"
          className="absolute inset-0 cursor-crosshair focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600"
          aria-label={"Add a pinned comment to " + alt}
          onClick={placePin}
        />
      ) : null}
      {status === "ready"
        ? pins.map((pin) => (
            <button
              key={pin.id}
              type="button"
              aria-label={"Comment " + pin.number + ": " + pin.body}
              aria-pressed={selectedPin === pin.id}
              title={pin.body}
              onClick={() => onSelectPin?.(pin.id)}
              className={
                "absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 " +
                (selectedPin === pin.id
                  ? "bg-teal-700 text-white"
                  : pin.resolved
                    ? "bg-zinc-700 text-white"
                    : "bg-amber-300 text-zinc-950")
              }
              style={{
                left: "clamp(14px, " + pin.x * 100 + "%, calc(100% - 14px))",
                top: "clamp(14px, " + pin.y * 100 + "%, calc(100% - 14px))",
              }}
            >
              {pin.number}
            </button>
          ))
        : null}
      {status === "ready" && draftPin ? (
        <span
          className="pointer-events-none absolute z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-700 text-white ring-2 ring-white"
          style={{
            left: "clamp(14px, " + draftPin.x * 100 + "%, calc(100% - 14px))",
            top: "clamp(14px, " + draftPin.y * 100 + "%, calc(100% - 14px))",
          }}
        >
          <span className="text-base" aria-hidden>
            +
          </span>
          <span className="sr-only">New comment location</span>
        </span>
      ) : null}
    </div>
  );
}
