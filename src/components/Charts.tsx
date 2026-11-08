import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { CHART_COLORS } from "./AppShell";

export function Donut({ data, total }: { data: { name: string; value: number; pct: number }[]; total: number }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44">
        <ResponsiveContainer>
          <PieChart><Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % 4]} />)}
          </Pie></PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold">{total}</span><span className="text-xs text-muted-foreground">kg CO₂e</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: CHART_COLORS[i % 4] }} />{d.name}<span className="ml-auto pl-4 font-semibold">{d.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ data, x }: { data: Record<string, string | number>[]; x: string }) {
  return (
    <div className="h-56"><ResponsiveContainer>
      <BarChart data={data}><CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey={x} fontSize={12} /><YAxis fontSize={12} width={30} /><Tooltip />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart>
    </ResponsiveContainer></div>
  );
}

export function Trend({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div className="h-56"><ResponsiveContainer>
      <AreaChart data={data}><CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} width={35} /><Tooltip />
        <Area type="monotone" dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.15} strokeWidth={2} /></AreaChart>
    </ResponsiveContainer></div>
  );
}
