import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Album,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/server/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Studio", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-zinc-200/80 bg-white/90 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 px-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
              <Album className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Album Approve</p>
              <p className="truncate text-xs text-zinc-500">Studio workspace</p>
            </div>
          </div>
          <Separator />
          <div className="px-4 py-4">
            <div className="rounded-lg border bg-zinc-50/80 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" aria-hidden />
                <span className="text-xs font-medium text-zinc-700">
                  Demo workspace
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Manage the sample Harper album from upload through approval.
              </p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  asChild
                  key={item.href}
                  variant="ghost"
                  className="h-10 justify-start gap-3 px-3 text-zinc-700 hover:bg-teal-50 hover:text-teal-900"
                >
                  <Link href={item.href}>
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="border-t bg-zinc-50/80 p-4">
            <div className="rounded-lg border bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  Owner
                </Badge>
              </div>
            </div>
            <form action={signOutAction} className="mt-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Album className="size-5 text-teal-700" aria-hidden="true" />
            Album Approve
          </Link>
          <form action={signOutAction}>
            <Button size="icon" variant="ghost" aria-label="Sign out">
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </header>
        <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
