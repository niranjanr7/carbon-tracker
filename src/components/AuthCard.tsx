import type { ReactNode } from "react";
import { Logo } from "./AppShell";
import hero from "@/assets/hero-earth.jpg";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative w-full max-w-md rounded-2xl bg-card p-8 shadow-soft">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-4 text-center font-display text-2xl font-bold">{title}</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
