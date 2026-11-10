import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, BarChart3, Lightbulb, Target, Trophy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { seo } from "@/lib/seo";
import hero from "@/assets/hero-earth.jpg";

export const Route = createFileRoute("/")({
  head: () => seo("Track Your Carbon", "Calculate your carbon footprint, make better choices and build a greener future."),
  component: Index,
});

const features = [
  { icon: Calculator, t: "Carbon Calculator", d: "Calculate daily & monthly emissions" },
  { icon: BarChart3, t: "Smart Analytics", d: "Track progress with charts" },
  { icon: Lightbulb, t: "Recommendations", d: "Get actionable tips" },
  { icon: Target, t: "Goal Tracking", d: "Set and achieve reduction goals" },
  { icon: Trophy, t: "Achievements", d: "Earn badges & rewards" },
  { icon: FileText, t: "Reports", d: "Download PDF & CSV reports" },
];
const steps = ["Enter your lifestyle information", "Calculate your footprint", "Understand your emissions", "Get personalized tips", "Reduce your impact", "Track your progress"];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features">Features</a><a href="#how">How it works</a>
        </nav>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
          <Button size="sm" asChild><Link to="/register">Register</Link></Button>
        </div>
      </header>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Green earth with sprouting leaves" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <h1 className="max-w-xl font-display text-4xl font-extrabold leading-tight text-primary-foreground md:text-6xl">
            Track Your Carbon. Change Your Impact.
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/85">
            Calculate your carbon footprint, make better choices and build a greener future. Together we can create a cleaner and healthier planet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/calculator">Calculate My Footprint</Link></Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground" asChild><Link to="/dashboard">View Dashboard</Link></Button>
          </div>
        </div>
      </section>
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold">Key Features</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {features.map((f) => (
            <div key={f.t} className="rounded-xl border bg-card p-5 text-center shadow-soft">
              <f.icon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-3 text-sm font-semibold">{f.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="how" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-2xl font-bold">How It Works</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-6">
          {steps.map((s, i) => (
            <div key={s} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</div>
              <p className="mt-3 text-sm text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
          <Logo /> <span>Small changes. Big impact.</span>
        </div>
      </footer>
    </div>
  );
}
