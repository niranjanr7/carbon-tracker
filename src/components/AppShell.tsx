import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Calculator, History, BarChart3, Lightbulb, Target, Trophy, FileText, User, LogOut, Leaf, Menu,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { RequireAuth } from "@/components/RequireAuth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-display text-lg font-bold ${light ? "text-sidebar-foreground" : "text-foreground"}`}>
      <Leaf className="h-6 w-6 text-primary" /> CarbonTracker
    </span>
  );
}

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShellContent title={title} subtitle={subtitle}>{children}</AppShellContent>
    </RequireAuth>
  );
}

function AppShellContent({ title, subtitle, children }: { title: string; subtitle: string | undefined; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await signOut(auth);
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? `Unable to log out: ${error.message}` : "Unable to log out.");
    }
  };
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-sidebar p-4 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 px-2"><Logo light /></div>
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} />}
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-start gap-3">
          <button className="rounded-md border bg-card p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <div>
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-5 shadow-soft ${className}`}>
      {title && <h2 className="mb-4 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
