import Link from "next/link";
import type React from "react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  HardDrive,
  MessageSquareText,
  Plus,
  Upload,
} from "lucide-react";
import { createProjectAction } from "@/app/actions/dashboard";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes, formatDate, formatDateTime } from "@/lib/format";
import { getCurrentUser } from "@/server/auth";
import { getDashboardData } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const { studio, projects, subscription, metrics, emailEvents } =
    await getDashboardData(user.id);

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(24,24,27,0.04)]">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px] lg:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-teal-200 bg-teal-50 text-teal-800"
              >
                {studio.name}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-800"
              >
                Studio workspace
              </Badge>
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Album proofing dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Manage active albums, upload spreads, send secure links, resolve
              review notes, and close approval from one studio workspace.
            </p>
          </div>
          <div className="rounded-lg border bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">Current focus</p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Open comments</span>
                <span className="font-semibold">{metrics.openComments}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Active projects</span>
                <span className="font-semibold">{metrics.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">Plan</span>
                <span className="font-semibold capitalize">
                  {subscription?.plan || "free"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric
          label="Active projects"
          value={metrics.activeProjects}
          icon={Upload}
          accent="teal"
        />
        <Metric
          label="Open comments"
          value={metrics.openComments}
          icon={MessageSquareText}
          accent="amber"
        />
        <Metric
          label="Approved"
          value={metrics.approvedVersions}
          icon={CheckCircle2}
          accent="emerald"
        />
        <Metric
          label="Storage used"
          value={formatBytes(metrics.totalStorageBytes)}
          icon={HardDrive}
          accent="blue"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="min-w-0">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Active and archived client album proofing projects.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard/settings">
                  Studio settings
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/70">
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium text-zinc-950 hover:text-teal-700"
                      >
                        {project.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500">
                        Created {formatDate(project.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-zinc-700">
                        {project.client.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {project.client.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={project.latestVersion?.status || project.status}
                      />
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {project.latestVersion
                        ? `v${project.latestVersion.versionNumber} · ${project.spreadCount} spreads`
                        : "No version"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {project.openCommentCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Add a client and start a new album version.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createProjectAction} className="space-y-4">
                <Field
                  label="Project title"
                  name="title"
                  placeholder="Collins heirloom album"
                />
                <Field
                  label="Client name"
                  name="clientName"
                  placeholder="Jordan Collins"
                />
                <Field
                  label="Client email"
                  name="clientEmail"
                  placeholder="client@example.com"
                  type="email"
                />
                <Field
                  label="Client phone"
                  name="clientPhone"
                  placeholder="+1 555 0100"
                />
                <Button className="w-full gap-2">
                  <Plus className="size-4" aria-hidden="true" />
                  Create album
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan and activity</CardTitle>
              <CardDescription>
                Subscription state and latest proofing notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-zinc-50 p-3">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {subscription?.plan || "free"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Renews {formatDate(subscription?.currentPeriodEnd)}
                  </p>
                </div>
                <StatusBadge status={subscription?.status || "trialing"} />
              </div>
              <div className="space-y-3">
                {emailEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border p-3"
                  >
                    <div className="mt-0.5 flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Bell className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {event.subject}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {event.to} · {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  accent: "teal" | "amber" | "emerald" | "blue";
}) {
  const accentClassName = {
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
  }[accent];

  return (
    <Card>
      <CardContent className="pt-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
          <div
            className={`flex size-10 items-center justify-center rounded-lg ring-1 ${accentClassName}`}
          >
            <Icon className="size-5" aria-hidden={true} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
        required
      />
    </div>
  );
}
