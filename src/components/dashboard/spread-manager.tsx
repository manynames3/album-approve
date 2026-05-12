"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  FileUp,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  deleteSpreadAction,
  reorderSpreadAction,
  replaceSpreadAction,
  uploadSpreadsAction,
} from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBytes } from "@/lib/format";
import type { Spread } from "@/server/types";

type SpreadManagerSpread = Spread & {
  signedUrl: string;
  thumbnailUrl: string;
  commentCount: number;
  openCommentCount: number;
};

type SpreadManagerProps = {
  projectId: string;
  albumVersionId: string;
  spreads: SpreadManagerSpread[];
};

export function SpreadManager({
  projectId,
  albumVersionId,
  spreads,
}: SpreadManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [replacementFiles, setReplacementFiles] = useState<
    Record<string, string>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function updateSelectedFiles(files: FileList | null) {
    setSelectedFiles(Array.from(files || []).map((file) => file.name));
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (!inputRef.current) {
      return;
    }

    inputRef.current.files = event.dataTransfer.files;
    updateSelectedFiles(event.dataTransfer.files);
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-w-0">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Album design files</CardTitle>
              <CardDescription>
                Reorder, replace, or remove the spreads clients flip through in
                the proof.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-zinc-50 text-zinc-700">
              {spreads.length} uploaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {spreads.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {spreads.map((spread, spreadIndex) => (
                <figure
                  key={spread.id}
                  id={`spread-${spread.id}`}
                  className="group min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:border-zinc-300"
                >
                  <div className="relative bg-[#f7f6f2] p-3">
                    <Image
                      src={spread.thumbnailUrl}
                      alt={`Spread ${spreadIndex + 1}: ${spread.filename}`}
                      width={spread.width || 1400}
                      height={spread.height || 900}
                      unoptimized
                      priority={spreadIndex === 0}
                      className="aspect-[14/9] w-full rounded-md object-cover ring-1 ring-black/5"
                    />
                    <div className="absolute left-5 top-5">
                      <Badge className="bg-zinc-950/85 text-white">
                        Spread {spreadIndex + 1}
                      </Badge>
                    </div>
                    {spread.openCommentCount ? (
                      <div className="absolute right-5 top-5">
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-800"
                        >
                          {spread.openCommentCount} open
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                  <figcaption className="space-y-3 border-t bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {spread.filename}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatBytes(spread.sizeBytes)}
                          {spread.sourcePage
                            ? ` · PDF page ${spread.sourcePage}`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right text-xs text-zinc-500">
                        <p>{spread.commentCount} comments</p>
                        <p>{spread.openCommentCount} open</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                          <form action={reorderSpreadAction}>
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="albumVersionId"
                              value={albumVersionId}
                            />
                            <input
                              type="hidden"
                              name="spreadId"
                              value={spread.id}
                            />
                            <input type="hidden" name="direction" value="up" />
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label={`Move ${spread.filename} up`}
                              disabled={spreadIndex === 0}
                            >
                              <ArrowUp className="size-4" aria-hidden="true" />
                            </Button>
                          </form>
                          <form action={reorderSpreadAction}>
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="albumVersionId"
                              value={albumVersionId}
                            />
                            <input
                              type="hidden"
                              name="spreadId"
                              value={spread.id}
                            />
                            <input
                              type="hidden"
                              name="direction"
                              value="down"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label={`Move ${spread.filename} down`}
                              disabled={spreadIndex === spreads.length - 1}
                            >
                              <ArrowDown
                                className="size-4"
                                aria-hidden="true"
                              />
                            </Button>
                          </form>
                        </div>
                        <form action={deleteSpreadAction}>
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <input
                            type="hidden"
                            name="albumVersionId"
                            value={albumVersionId}
                          />
                          <input
                            type="hidden"
                            name="spreadId"
                            value={spread.id}
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            aria-label={`Delete ${spread.filename}`}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </form>
                      </div>
                      <form
                        action={replaceSpreadAction}
                        className="flex min-w-0 gap-2"
                      >
                        <input
                          type="hidden"
                          name="projectId"
                          value={projectId}
                        />
                        <input
                          type="hidden"
                          name="albumVersionId"
                          value={albumVersionId}
                        />
                        <input
                          type="hidden"
                          name="spreadId"
                          value={spread.id}
                        />
                        <Input
                          id={`replacement-${spread.id}`}
                          name="replacement"
                          type="file"
                          accept="image/jpeg,image/png"
                          aria-label={`Replacement file for ${spread.filename}`}
                          className="sr-only"
                          onChange={(event) =>
                            setReplacementFiles((current) => ({
                              ...current,
                              [spread.id]: event.target.files?.[0]?.name || "",
                            }))
                          }
                        />
                        <Label
                          htmlFor={`replacement-${spread.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            className:
                              "min-w-0 flex-1 cursor-pointer justify-start px-3",
                          })}
                        >
                          <FileUp className="size-4" aria-hidden="true" />
                          <span className="truncate">
                            {replacementFiles[spread.id] ||
                              "Choose replacement"}
                          </span>
                        </Label>
                        <Button
                          variant="outline"
                          aria-label={`Replace ${spread.filename}`}
                        >
                          <RefreshCw className="size-4" aria-hidden="true" />
                          Replace
                        </Button>
                      </form>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-zinc-50 p-8 text-center">
              <FileUp className="size-10 text-zinc-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">
                No album design files uploaded
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Upload exported JPG, PNG, or PDF spreads to create a flippable
                client proof.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <CardTitle>Upload album design files</CardTitle>
          <CardDescription>
            Drag exported album spreads here or browse. JPG/PNG are limited to
            15 MB; PDF imports are limited to 50 MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={uploadSpreadsAction}
            className="space-y-4"
            onSubmit={() => setIsUploading(true)}
          >
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="albumVersionId" value={albumVersionId} />
            <Label
              htmlFor={`spreads-${albumVersionId}`}
              className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
                isDragging
                  ? "border-teal-500 bg-teal-50"
                  : "border-zinc-300 bg-[#fbfaf6] hover:border-emerald-300 hover:bg-emerald-50/60"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-zinc-200">
                <Upload className="size-6" aria-hidden="true" />
              </div>
              <span className="mt-3 text-sm font-medium">
                Drop JPG, PNG, or exported PDF files
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                Each file becomes part of the client flip-through proof.
              </span>
            </Label>
            <Input
              ref={inputRef}
              id={`spreads-${albumVersionId}`}
              name="spreads"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              multiple
              onChange={(event) => updateSelectedFiles(event.target.files)}
            />
            {selectedFiles.length ? (
              <div className="rounded-lg border bg-white p-3 text-sm">
                <p className="font-medium">Ready to upload</p>
                <ul className="mt-2 space-y-1 text-zinc-600">
                  {selectedFiles.map((fileName) => (
                    <li key={fileName} className="truncate">
                      {fileName}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {isUploading ? (
              <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
                Uploading and processing files...
              </div>
            ) : null}
            <Button className="w-full gap-2" disabled={isUploading}>
              <Upload className="size-4" aria-hidden="true" />
              {isUploading ? "Uploading" : "Upload design files"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
