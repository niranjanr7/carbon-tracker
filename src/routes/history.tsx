import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteRecord, totalOf, useRecords } from "@/lib/carbon";
import { seo } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => seo("History", "All your carbon footprint records."),
  component: HistoryPage,
});

const PER = 10;
function HistoryPage() {
  const records = useRecords();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const rows = records.filter((r) => (!from || r.date >= from) && (!to || r.date <= to));
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  return (
    <AppShell title="Carbon Records" subtitle="Your daily emission history">
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input type="date" className="w-auto" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
          <Input type="date" className="w-auto" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground"><tr>{["Date", "Transport", "Energy", "LPG", "Food", "Total", ""].map((h) => <th key={h} className="border-b p-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(page * PER, page * PER + PER).map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.date}</td><td className="p-2">{r.transport}</td><td className="p-2">{r.energy}</td><td className="p-2">{r.lpg}</td><td className="p-2">{r.food}</td>
                  <td className="p-2 font-semibold">{totalOf(r)}</td>
                  <td className="p-2"><button aria-label="Delete" onClick={() => {
                    void deleteRecord(r.id).catch((error: unknown) => toast.error(
                      error instanceof Error ? `Unable to delete record: ${error.message}` : "Unable to delete record.",
                    ));
                  }}><Trash2 className="h-4 w-4 text-destructive" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
          <span>{page + 1} / {pages}</span>
          <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </Panel>
    </AppShell>
  );
}
