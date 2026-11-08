import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Award, Globe2, Recycle, CalendarCheck, Lock } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { stats, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/achievements")({
  head: () => seo("Achievements", "Badges you've earned on your green journey."),
  component: Achievements,
});

function Achievements() {
  const records = useRecords();
  const s = stats(records);
  const list = [
    { icon: Leaf, t: "Green Starter", d: "Complete your first calculation", ok: records.length >= 1 },
    { icon: Award, t: "Eco Learner", d: "Log 7 records", ok: records.length >= 7 },
    { icon: Globe2, t: "Climate Champion", d: "Reduce monthly emissions by 10%", ok: s.change <= -10 },
    { icon: Recycle, t: "Carbon Reducer", d: "Reach a score of 70", ok: s.score >= 70 },
    { icon: CalendarCheck, t: "Consistent Tracker", d: "Log 30 records", ok: records.length >= 30 },
    { icon: Lock, t: "More coming soon", d: "Keep going!", ok: false },
  ];
  return (
    <AppShell title="Your Achievements" subtitle="Keep going! You're making a difference.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <Panel key={a.t} className={`text-center ${a.ok ? "" : "opacity-50"}`}>
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${a.ok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><a.icon className="h-8 w-8" /></div>
            <p className="mt-3 font-semibold">{a.t}</p><p className="text-sm text-muted-foreground">{a.d}</p>
            <p className="mt-2 text-xs text-primary">{a.ok ? "Unlocked" : "Locked"}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
