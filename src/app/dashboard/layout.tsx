import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { BrandWordmark } from "@/components/brand";
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
    <div className="min-h-screen bg-[#f7f6f2] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-zinc-200/80 bg-[#fbfaf6]/95 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-24 items-center gap-3 px-5">
            <div className="min-w-0">
              <BrandWordmark className="text-[1.02rem] tracking-[0.26em]" />
              <p className="mt-2 truncate text-xs font-medium text-zinc-500">
                Studio workspace
              </p>
            </div>
          </div>
          <Separator />
          <div className="px-5 py-5">
            <div className="border-y border-zinc-200 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-emerald-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Demo workspace
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Harper album review from upload to approval.
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
                  className="h-10 justify-start gap-3 px-3 text-zinc-700 hover:bg-white hover:text-zinc-950 hover:shadow-[0_1px_1px_rgba(24,24,27,0.04)]"
                >
                  <Link href={item.href}>
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="border-t border-zinc-200 bg-[#fbfaf6] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {user.email}
                </p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Owner
              </span>
            </div>
            <form action={signOutAction} className="mt-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-zinc-200 bg-white shadow-none"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-[#fbfaf6]/95 px-4 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BrandWordmark className="text-[0.94rem] tracking-[0.24em]" />
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
