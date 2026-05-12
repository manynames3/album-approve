import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      className={cn("size-9 shrink-0", className)}
    >
      <rect
        width="48"
        height="48"
        rx="10"
        fill={isLight ? "#f8f5ec" : "#18181b"}
      />
      <path
        d="M13.5 15.5h10.2c2.7 0 5.1 1.3 6.6 3.4v13.6c-1.5-2.1-3.9-3.4-6.6-3.4H13.5V15.5Z"
        fill="none"
        stroke={isLight ? "#18181b" : "#f8f5ec"}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M30.3 18.9c1.2-1.8 3.3-3 5.7-3h1.5v13.2H36c-2.4 0-4.5 1.2-5.7 3"
        fill="none"
        stroke={isLight ? "#18181b" : "#f8f5ec"}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="m18.3 22.9 3.1 3.1 5.9-6.2"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-sans text-[0.95rem] font-semibold uppercase tracking-[0.32em]",
        className,
      )}
    >
      Album Approve
    </span>
  );
}

export function BrandLockup({
  className,
  markTone,
  wordmarkClassName,
}: {
  className?: string;
  markTone?: "dark" | "light";
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark tone={markTone} />
      <BrandWordmark className={wordmarkClassName} />
    </span>
  );
}
