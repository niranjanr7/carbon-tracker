import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, CHART_COLORS } from "@/components/AppShell";
import { Donut, Bars, Trend } from "@/components/Charts";
import { stats, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/analytics")({
  head: () => seo("Analytics", "Charts and breakdowns of your emissions."),
  component: Analytics,
});

function Analytics() {
  const s = stats(useRecords());
  return (
    <AppShell title="Emissions Analytics" subtitle="Last 6 months">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Emission Breakdown"><Donut data={s.breakdown} total={s.total} /></Panel>
        <Panel title="Daily Emissions"><Bars data={s.daily} x="day" /></Panel>
        <Panel title="Monthly Trend"><Trend data={s.monthly} /></Panel>
        <Panel title="Category Comparison">
          <div className="space-y-4">
            {s.breakdown.map((b, i) => (
              <div key={b.name}>
                <div className="mb-1 flex justify-between text-sm"><span>{b.name}</span><span>{b.pct}%</span></div>
                <div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full" style={{ width: `${b.pct}%`, background: CHART_COLORS[i] }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
