import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Award, Sprout, TreePine, TrendingDown } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ecoGradeForMonthlyEmissions,
  getMonthlyGoal,
  monthlyGoalStreak,
  monthlyPerPersonTotals,
  setMonthlyGoal,
  useRecords,
} from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/goals")({
  head: () => seo("Goals", "Set a monthly carbon goal and track your eco progress."),
  component: Goals,
});

const TREE_ABSORPTION_KG_PER_YEAR = 22;
const currentMonth = new Date().toISOString().slice(0, 7);
const gradeStyles = {
  A: "bg-primary text-primary-foreground",
  B: "bg-secondary text-secondary-foreground",
  C: "bg-muted text-foreground",
  D: "bg-accent text-accent-foreground",
  E: "bg-destructive text-destructive-foreground",
};

function Goals() {
  const records = useRecords();
  const monthlyTotals = monthlyPerPersonTotals(records);
  const totalsByMonth = new Map(monthlyTotals.map(({ month, value }) => [month, value]));
  const thisMonth = totalsByMonth.get(currentMonth);
  const [goal, setGoal] = useState(100);
  const [goalInput, setGoalInput] = useState("100");
  const goalStreak = monthlyGoalStreak(monthlyTotals, goal, currentMonth);

  useEffect(() => {
    const savedGoal = getMonthlyGoal();
    setGoal(savedGoal);
    setGoalInput(String(savedGoal));
  }, []);

  const progress = thisMonth === undefined ? 0 : Math.min(100, (thisMonth / goal) * 100);
  const treeYears = thisMonth === undefined ? null : thisMonth / TREE_ABSORPTION_KG_PER_YEAR;
  const recentMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(`${currentMonth}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() - index);
    const month = date.toISOString().slice(0, 7);
    return { month, value: totalsByMonth.get(month) };
  });
  const reductionStreak = (() => {
    let streak = 0;
    for (let index = monthlyTotals.length - 1; index > 0; index -= 1) {
      const current = monthlyTotals[index];
      const previous = monthlyTotals[index - 1];
      if (!current || !previous) break;
      const expectedCurrentMonth = new Date(`${previous.month}-01T00:00:00Z`);
      expectedCurrentMonth.setUTCMonth(expectedCurrentMonth.getUTCMonth() + 1);
      if (expectedCurrentMonth.toISOString().slice(0, 7) !== current.month || current.value >= previous.value) break;
      streak += 1;
    }
    return streak;
  })();
  const under100 = monthlyTotals.some(({ value }) => value < 100);

  const save = () => {
    const value = Number(goalInput);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a monthly goal greater than 0.");
      return;
    }
    const rounded = Math.round(value * 10) / 10;
    setGoal(rounded);
    setGoalInput(String(rounded));
    setMonthlyGoal(rounded);
    toast.success(`Monthly goal set to ${rounded} kg CO₂e per person`);
  };

  return (
    <AppShell title="Carbon Goals & Eco Score" subtitle="Set a monthly per-person target and celebrate your progress.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="space-y-5 lg:col-span-2">
          <div>
            <h2 className="font-display text-lg font-bold">Monthly carbon goal</h2>
            <p className="text-sm text-muted-foreground">Your target is measured in kg CO₂e per person.</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="w-44">
                <label htmlFor="monthly-carbon-goal" className="text-sm font-medium">Monthly target (kg)</label>
                <Input
                  id="monthly-carbon-goal"
                  type="number"
                  min={1}
                  step="any"
                  value={goalInput}
                  onChange={(event) => setGoalInput(event.target.value)}
                />
              </div>
              <Button onClick={save}>Save Goal</Button>
            </div>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
              <span>Monthly goal used</span>
              <span>{thisMonth === undefined ? "No entries this month" : `${progress.toFixed(0)}% · ${thisMonth} / ${goal} kg`}</span>
            </div>
            <Progress value={progress} aria-label="Monthly carbon goal used" />
            <p className="mt-2 text-xs text-muted-foreground">
              {thisMonth === undefined
                ? "Log a footprint to start tracking this month's goal."
                : thisMonth <= goal
                  ? `${+(goal - thisMonth).toFixed(1)} kg CO₂e per person remaining in your target.`
                  : `${+(thisMonth - goal).toFixed(1)} kg CO₂e per person over your target so far.`}
            </p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <p className="font-semibold">Goal streak: {goalStreak} {goalStreak === 1 ? "month" : "months"}</p>
            <p className="text-sm text-muted-foreground">Consecutive months at or below your target, including this month if you are currently on track.</p>
          </div>
        </Panel>

        <Panel className="flex flex-col items-center justify-center text-center">
          <TreePine className="h-16 w-16 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Tree-years to offset this month's per-person emissions</p>
          <p className="font-display text-3xl font-bold text-primary">{treeYears === null ? "—" : treeYears.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Approximate estimate using {TREE_ABSORPTION_KG_PER_YEAR} kg CO₂ absorbed per tree per year.</p>
        </Panel>
      </div>

      <Panel className="mt-4" title="Monthly eco score">
        <p className="mb-4 text-sm text-muted-foreground">Grades are based on recorded kg CO₂e per person per month: A &lt;100, B 100–199, C 200–299, D 300–399, E 400+.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentMonths.map(({ month, value }) => {
            const grade = value === undefined ? null : ecoGradeForMonthlyEmissions(value);
            const monthLabel = new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" });
            return (
              <div key={month} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{monthLabel}</p>
                  <p className="text-sm text-muted-foreground">{value === undefined ? "No data" : `${value} kg CO₂e / person`}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${grade ? gradeStyles[grade] : "bg-muted text-muted-foreground"}`}>
                  {grade ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="mt-4" title="Eco badges">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`flex items-center gap-3 rounded-lg border p-4 ${reductionStreak >= 3 ? "" : "opacity-50"}`}>
            <TrendingDown className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">3 months of reduction</p>
              <p className="text-sm text-muted-foreground">Three consecutive month-over-month reductions.</p>
              <p className="mt-1 text-xs text-primary">{reductionStreak >= 3 ? "Unlocked" : `${reductionStreak}/3 consecutive reductions`}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 rounded-lg border p-4 ${under100 ? "" : "opacity-50"}`}>
            <Award className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Under 100 kg</p>
              <p className="text-sm text-muted-foreground">Record a month below 100 kg CO₂e per person.</p>
              <p className="mt-1 text-xs text-primary">{under100 ? "Unlocked" : "Locked"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Sprout className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Monthly goal streak</p>
              <p className="text-sm text-muted-foreground">Keep each month's per-person emissions within your target.</p>
              <p className="mt-1 text-xs text-primary">{goalStreak} {goalStreak === 1 ? "month" : "months"} in a row</p>
            </div>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
