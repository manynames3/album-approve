import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";

const statusClassName: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-600",
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  shared: "border-sky-200 bg-sky-50 text-sky-700",
  changes_requested: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  trialing: "border-blue-200 bg-blue-50 text-blue-700",
  active_subscription: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        statusClassName[status] || "border-zinc-200 bg-zinc-50 text-zinc-700"
      }
    >
      {statusLabel(status)}
    </Badge>
  );
}
