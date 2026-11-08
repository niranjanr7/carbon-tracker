import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Download, Printer } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { totalOf, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reports")({
  head: () => seo("Reports", "Download or print your carbon footprint report."),
  component: Reports,
});

const sel = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
function Reports() {
  const records = useRecords();
  const [period, setPeriod] = useState("30");
  const cutoff = new Date(Date.now() - +period * 864e5).toISOString().slice(0, 10);
  const rows = records.filter((r) => r.date >= cutoff);
  const csv = () => {
    const body = ["Date,Transport,Energy,LPG,Food,Total", ...rows.map((r) => [r.date, r.transport, r.energy, r.lpg, r.food, totalOf(r)].join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
    a.download = "carbon-report.csv"; a.click();
  };
  const total = rows.reduce((a, r) => a + totalOf(r), 0).toFixed(1);
  return (
    <AppShell title="Generate Report" subtitle="Download or print your carbon footprint report.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="space-y-4 lg:col-span-2">
          <div><label className="text-sm font-medium">Time Period</label>
            <select className={sel} value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 3 months</option><option value="180">Last 6 months</option>
            </select></div>
          <p className="text-sm">{rows.length} records · <b>{total} kg CO₂e</b> total</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={csv}><Download className="h-4 w-4" /> Download CSV</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save PDF</Button>
          </div>
        </Panel>
        <Panel className="flex flex-col items-center justify-center text-center">
          <FileText className="h-16 w-16 text-primary" /><p className="mt-3 text-sm text-muted-foreground">Get a detailed report of your carbon footprint.</p>
        </Panel>
      </div>
    </AppShell>
  );
}
