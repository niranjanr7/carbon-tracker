import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel } from "@/components/AppShell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo("About", "Why we built CarbonTracker and how it works."),
  component: About,
});

function About() {
  return (
    <AppShell title="About the Project" subtitle="A cleaner planet starts with you.">
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Problem Statement"><p className="text-sm text-muted-foreground">Daily activities like travel, electricity use, cooking and food choices contribute to climate change, and individuals rarely know their own impact.</p></Panel>
        <Panel title="Proposed Solution"><p className="text-sm text-muted-foreground">CarbonTracker helps you estimate your footprint, spot your biggest sources, set reduction goals and get personalized recommendations.</p></Panel>
        <Panel title="Methodology" className="md:col-span-2"><p className="text-sm text-muted-foreground">Emissions use standard factors: petrol car 0.212 kg/km, bus 0.089 kg/km, electricity 0.82 kg/kWh, LPG 2.98 kg/kg, and daily diet averages from 1.5 to 3.3 kg CO₂e.</p></Panel>
      </div>
    </AppShell>
  );
}
