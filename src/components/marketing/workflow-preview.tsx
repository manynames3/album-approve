"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  MessageSquareText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const steps = [
  {
    id: "upload",
    label: "Upload",
    icon: FileUp,
    title: "Your design. Ready for review.",
    description:
      "Add exported JPG or PNG spreads to a client album. Keep the design work in the tools you already use.",
    alt: "Studio workspace with four wedding album spreads and two image files selected for upload",
    href: "/sign-up",
    cta: "Try the studio workspace",
  },
  {
    id: "feedback",
    label: "Review",
    icon: MessageSquareText,
    title: "Know exactly what needs changing.",
    description:
      "Send one link. Clients flip through the album and pin notes to the spread, without creating an account.",
    alt: "Client proof with a numbered pin on the ceremony spread and its matching image-swap comment",
    href: "/proof/demo-proof-token",
    cta: "Try leaving a comment",
  },
  {
    id: "approval",
    label: "Approve",
    icon: CheckCircle2,
    title: "A clear decision before print.",
    description:
      "Clients confirm the album version they are approving. The decision stays with that version.",
    alt: "Album approval confirmation identifying version one, the reviewer, and the production approval checkbox",
    href: "/proof/demo-proof-token",
    cta: "Explore the client proof",
  },
];

export function WorkflowPreview() {
  return (
    <Tabs defaultValue="upload" className="mt-10 gap-6" data-workflow-preview>
      <TabsList
        aria-label="Album proofing workflow"
        className="mx-auto grid w-full max-w-md grid-cols-3 bg-zinc-100 group-data-horizontal/tabs:h-12"
      >
        {steps.map((step, index) => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            aria-label={`${index + 1}. ${step.label}`}
            className="gap-1 text-xs sm:gap-2 sm:text-sm"
          >
            <step.icon className="size-4" aria-hidden />
            <span>
              <span className="hidden sm:inline">{index + 1}. </span>
              {step.label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {steps.map((step) => (
        <TabsContent key={step.id} value={step.id} className="space-y-6">
          <div className="mx-auto min-h-24 max-w-xl text-center">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {step.description}
            </p>
          </div>
          <figure className="mx-auto max-w-5xl">
            <div className="relative mx-auto aspect-[390/844] max-w-[390px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 shadow-[0_12px_40px_rgba(24,24,27,0.06)] sm:aspect-[1440/1000] sm:max-w-none">
              <picture>
                <source
                  media="(max-width: 639px)"
                  srcSet={`/product/workflow-${step.id}-mobile.webp`}
                />
                <Image
                  src={`/product/workflow-${step.id}-desktop.webp`}
                  alt={step.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 100vw, 1024px"
                  className="object-contain"
                />
              </picture>
            </div>
            <figcaption className="mt-5 text-center">
              <Link
                href={step.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
              >
                {step.cta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </figcaption>
          </figure>
        </TabsContent>
      ))}
    </Tabs>
  );
}
