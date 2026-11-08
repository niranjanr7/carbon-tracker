import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sprout } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getGoal, setGoal, stats, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/goals")({
  head: () => seo("Goals", "Set a monthly reduction goal and track your progress."),
  component: Goals,
});

function Goals() {
  const s = stats(useRecords());
  const [goal, setG] = useState(20);
  const [custom, setCustom] = useState("");
  useEffect(() => setG(getGoal()), []);
  const base = s.lastMonth || s.thisMonth;
  const target = +(base * (1 - goal / 100)).toFixed(1);
  const achieved = base ? Math.max(0, ((base - s.thisMonth) / base) * 100) : 0;
  const progress = Math.min(100, Math.round((achieved / goal) * 100));
  const save = (g: number) => { setG(g); setGoal(g); toast.success(`Goal set to ${g}%`); };
  return (
    <AppShell title="Carbon Reduction Goals" subtitle="Set your monthly reduction goal and track your progress.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-muted-foreground">Last Month</p><p className="font-display text-2xl font-bold">{base} kg</p></div>
            <div><p className="text-sm text-muted-foreground">Target ({goal}% goal)</p><p className="font-display text-2xl font-bold text-primary">{target} kg</p></div>
          </div>
          <div className="mt-6"><div className="mb-2 flex justify-between text-sm"><span>Progress</span><span>{progress}%</span></div><Progress value={progress} /></div>
          <p className="mt-2 text-xs text-muted-foreground">This month so far: {s.thisMonth} kg CO₂e</p>
          <h3 className="mt-8 font-semibold">Set New Goal</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {[5, 10, 20, 30].map((g) => <Button key={g} variant={goal === g ? "default" : "outline"} onClick={() => save(g)}>{g}%</Button>)}
            <Input className="w-28" type="number" placeholder="Custom %" value={custom} onChange={(e) => setCustom(e.target.value)} />
            <Button variant="secondary" onClick={() => custom && save(Math.min(100, Math.max(1, +custom)))}>Set Goal</Button>
          </div>
        </Panel>
        <Panel className="flex flex-col items-center justify-center text-center">
          <Sprout className="h-20 w-20 text-primary" /><p className="mt-4 font-display text-lg font-bold">Small steps</p><p className="text-sm text-muted-foreground">make a big difference.</p>
        </Panel>
      </div>
    </AppShell>
  );
}
