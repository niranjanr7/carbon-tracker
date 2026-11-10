import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Calendar, Globe, Award, Car, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Donut, Bars, Trend } from "@/components/Charts";
import { useUser, stats, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  head: () => seo("Dashboard", "Your carbon footprint at a glance."),
  component: Dashboard,
});

function Stat({ icon: I, label, value, sub }: { icon: typeof Leaf; label: string; value: string; sub: string }) {
  return (
    <Panel className="flex items-center gap-4">
      <div className="rounded-lg bg-secondary p-3"><I className="h-6 w-6 text-primary" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-bold">{value}</p><p className="text-xs text-primary">{sub}</p></div>
    </Panel>
  );
}

function Dashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const records = useRecords();
  const s = stats(records);
  const user = useUser();
  const down = s.change <= 0;
  return (
    <AppShell title={`Welcome back, ${user.name}!`} subtitle="Let's make a positive impact today.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Leaf} label="Latest Footprint" value={`${s.latest} kg CO₂e`} sub="Most recent entry" />
        <Stat icon={Calendar} label="This Month" value={`${s.thisMonth} kg CO₂e`} sub={`${Math.abs(s.change)}% ${down ? "below" : "above"} last month`} />
        <Stat icon={Globe} label="Total Emissions" value={`${s.total} kg`} sub={`${records.length} records`} />
        <Stat icon={Award} label="Environmental Score" value={`${s.score}/100`} sub={s.score > 60 ? "Good progress!" : "Room to improve"} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Emission Sources"><Donut data={s.breakdown} total={s.thisMonth} /></Panel>
        <Panel title="Daily Emissions"><Bars data={s.daily} x="day" /></Panel>
        <Panel title="Monthly Trend"><Trend data={s.monthly} /></Panel>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel className="flex items-center gap-4">
          <Car className="h-10 w-10 text-chart-2" />
          <div><p className="text-sm text-muted-foreground">Your Highest Emission Category</p><p className="font-semibold text-primary">{s.top?.name} ({s.top?.pct}%)</p></div>
        </Panel>
        <Panel className="flex items-center gap-4">
          {down ? <TrendingDown className="h-10 w-10 text-primary" /> : <TrendingUp className="h-10 w-10 text-destructive" />}
          <div><p className="text-sm text-muted-foreground">This Month vs Last Month</p><p className="font-display text-2xl font-bold">{s.change}%</p></div>
        </Panel>
      </div>
    </AppShell>
  );
}
