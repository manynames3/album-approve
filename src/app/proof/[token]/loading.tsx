import { Skeleton } from "@/components/ui/skeleton";

export default function ProofLoading() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    </main>
  );
}
