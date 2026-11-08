import { createFileRoute } from "@tanstack/react-router";
import { Bus, Car, Bike, Lightbulb, Salad, Flame, AlertTriangle } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { stats, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/recommendations")({
  head: () => seo("Recommendations", "Personalized tips to reduce your carbon footprint."),
  component: Recs,
});

const tips = [
  { cat: "Transport", icon: Bus, t: "Use Public Transport", d: "Switch to buses, trains or metro for longer distances.", lvl: "Easy", save: "-2.5" },
  { cat: "Transport", icon: Car, t: "Carpool or Share Rides", d: "Share your ride with colleagues or friends.", lvl: "Medium", save: "-1.8" },
  { cat: "Transport", icon: Bike, t: "Walk or Cycle for Short Distances", d: "Use walking or cycling for trips under 5 km.", lvl: "Easy", save: "-1.2" },
  { cat: "Energy", icon: Lightbulb, t: "Switch to LED & Unplug Devices", d: "Cut standby power and use efficient lighting.", lvl: "Easy", save: "-0.8" },
  { cat: "LPG", icon: Flame, t: "Cook Efficiently", d: "Use pressure cookers and lids to save LPG.", lvl: "Easy", save: "-0.4" },
  { cat: "Food", icon: Salad, t: "Eat More Plant-Based Meals", d: "Replace a few meat meals per week.", lvl: "Medium", save: "-0.9" },
];

function Recs() {
  const s = stats(useRecords());
  const sorted = [...tips].sort((a, b) => (a.cat === s.top?.name ? -1 : 0) - (b.cat === s.top?.name ? -1 : 0));
  return (
    <AppShell title="Personalized Recommendations" subtitle="Based on your data, here are some suggestions to reduce your footprint.">
      <Panel className="mb-4 flex items-center gap-4 bg-accent">
        <AlertTriangle className="h-8 w-8 text-chart-3" />
        <div><p className="text-sm text-muted-foreground">Highest Emission Category</p><p className="font-semibold">{s.top?.name} ({s.top?.pct}%)</p></div>
      </Panel>
      <div className="space-y-3">
        {sorted.map((t) => (
          <Panel key={t.t} className="flex items-center gap-4">
            <div className="rounded-lg bg-secondary p-3"><t.icon className="h-6 w-6 text-primary" /></div>
            <div className="flex-1">
              <p className="font-semibold">{t.t}</p><p className="text-sm text-muted-foreground">{t.d}</p>
              <div className="mt-2 flex gap-2"><Badge variant="secondary">{t.lvl}</Badge><span className="text-xs text-primary">{t.save} kg CO₂e/day</span></div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
