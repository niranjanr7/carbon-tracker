import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addRecord, dailyElectricityEmissions, FACTORS } from "@/lib/carbon";
import { seo } from "@/lib/seo";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/calculator")({
  head: () => seo("Carbon Calculator", "Enter your daily activities to calculate your carbon footprint."),
  component: CalculatorPage,
});

const sel = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
type Mode = "Car" | "Bus" | "Train" | "Bike" | "Bicycle";
type Fuel = keyof typeof FACTORS.transport.Car;
type Diet = keyof typeof FACTORS.food;

const normalizeLeadingZeros = (value: string) => value.replace(/^(-?)0+(?=\d)/, "$1");
const numericValue = (value: string) => Number(value) || 0;

function CalculatorPage() {
  return <RequireAuth><CalculatorContent /></RequireAuth>;
}

function CalculatorContent() {
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("Car");
  const [fuel, setFuel] = useState<Fuel>("Petrol");
  const [km, setKm] = useState("20");
  const [electricityUnits, setElectricityUnits] = useState("240");
  const [billingDays, setBillingDays] = useState("30");
  const [householdMembers, setHouseholdMembers] = useState("1");
  const [lpg, setLpg] = useState("0.5");
  const [diet, setDiet] = useState<Diet>("Mixed");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const factor = mode === "Car" ? FACTORS.transport.Car[fuel] : FACTORS.transport[mode];
  const kmValue = numericValue(km);
  const electricityUnitsValue = numericValue(electricityUnits);
  const billingDaysValue = numericValue(billingDays);
  const householdMembersValue = Math.max(1, Math.floor(numericValue(householdMembers)));
  const lpgValue = numericValue(lpg);
  const t = +(kmValue * factor).toFixed(2);
  const e = +dailyElectricityEmissions(electricityUnitsValue, billingDaysValue).toFixed(2);
  const l = +(lpgValue * FACTORS.lpgPerKg).toFixed(2);
  const dailyEnergyEmissions = +(e + l).toFixed(2);
  const perPersonEnergyEmissions = +(dailyEnergyEmissions / householdMembersValue).toFixed(2);
  const f = FACTORS.food[diet];
  const total = +(t + e + l + f).toFixed(2);

  const Result = ({ label, value, calc }: { label: string; value: number; calc: string }) => (
    <div className="rounded-xl bg-secondary p-5">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold text-primary">{value} <span className="text-base">kg CO₂e/day</span></p>
      <p className="mt-3 text-xs text-muted-foreground">Calculation: {calc}</p>
    </div>
  );

  return (
    <AppShell title="Carbon Footprint Calculator" subtitle="Enter your daily activities to calculate your carbon footprint.">
      <Panel>
        <Tabs defaultValue="transport">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="transport">Transportation</TabsTrigger>
            <TabsTrigger value="energy">Energy & Electricity</TabsTrigger>
            <TabsTrigger value="food">Food Habits</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="transport" className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div><Label>Transport Type</Label><select className={sel} value={mode} onChange={(x) => setMode(x.target.value as Mode)}>{["Car", "Bus", "Train", "Bike", "Bicycle"].map((m) => <option key={m}>{m}</option>)}</select></div>
              {mode === "Car" && <div><Label>Fuel Type</Label><select className={sel} value={fuel} onChange={(x) => setFuel(x.target.value as Fuel)}>{Object.keys(FACTORS.transport.Car).map((m) => <option key={m}>{m}</option>)}</select></div>}
              <div><Label>Distance per day (km)</Label><Input type="number" min={0} value={km} onChange={(x) => setKm(normalizeLeadingZeros(x.target.value))} onBlur={(x) => { if (!x.currentTarget.value) setKm("0"); }} /></div>
            </div>
            <Result label="Transport Emissions" value={t} calc={`${km} km × ${factor} = ${t} kg CO₂e`} />
          </TabsContent>
          <TabsContent value="energy" className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label>Electricity units used (kWh)</Label>
                <Input type="number" min={0} step="any" value={electricityUnits} onChange={(x) => setElectricityUnits(normalizeLeadingZeros(x.target.value))} onBlur={(x) => { if (!x.currentTarget.value) setElectricityUnits("0"); }} />
                <p className="mt-1 text-xs text-muted-foreground">Find the units used on your electricity bill.</p>
              </div>
              <div><Label>Billing period (days)</Label><Input type="number" min={1} step={1} value={billingDays} onChange={(x) => setBillingDays(normalizeLeadingZeros(x.target.value))} onBlur={(x) => { if (!x.currentTarget.value || Number(x.currentTarget.value) < 1) setBillingDays("30"); }} /></div>
              <div>
                <Label>People in household</Label>
                <Input type="number" min={1} step={1} value={householdMembers} onChange={(x) => setHouseholdMembers(normalizeLeadingZeros(x.target.value))} onBlur={() => setHouseholdMembers(String(householdMembersValue))} />
                <p className="mt-1 text-xs text-muted-foreground">Used to estimate an equal share per person.</p>
              </div>
              <div><Label>LPG per day (kg)</Label><Input type="number" min={0} step={0.1} value={lpg} onChange={(x) => setLpg(normalizeLeadingZeros(x.target.value))} onBlur={(x) => { if (!x.currentTarget.value) setLpg("0"); }} /></div>
            </div>
            <div className="space-y-4">
              <Result label="Household Energy Emissions" value={dailyEnergyEmissions} calc={`${electricityUnitsValue} kWh ÷ ${billingDaysValue} days × ${FACTORS.electricityPerKwh} kg CO₂e/kWh + ${lpgValue} kg LPG × ${FACTORS.lpgPerKg}`} />
              <Result label="Equal-share estimate per person" value={perPersonEnergyEmissions} calc={`${dailyEnergyEmissions} kg CO₂e/day ÷ ${householdMembersValue} household member${householdMembersValue === 1 ? "" : "s"}`} />
            </div>
          </TabsContent>
          <TabsContent value="food" className="mt-6 grid gap-6 md:grid-cols-2">
            <div><Label>Diet Type</Label><select className={sel} value={diet} onChange={(x) => setDiet(x.target.value as Diet)}>{Object.keys(FACTORS.food).map((m) => <option key={m}>{m}</option>)}</select></div>
            <Result label="Food Emissions" value={f} calc={`${diet} diet average`} />
          </TabsContent>
          <TabsContent value="summary" className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p>Transport: <b>{t}</b> kg</p><p>Electricity: <b>{e}</b> kg</p><p>LPG: <b>{l}</b> kg</p><p>Food: <b>{f}</b> kg</p>
              <div className="pt-2"><Label>Date</Label><Input type="date" value={date} onChange={(x) => setDate(x.target.value)} /></div>
            </div>
            <div className="space-y-4">
              <Result label="Total Daily Footprint" value={total} calc="Sum of all categories" />
              <Button className="w-full" onClick={() => { addRecord({ date, transport: t, energy: e, lpg: l, food: f, householdMembers: householdMembersValue }); toast.success("Record saved"); nav({ to: "/history" }); }}>Save Record</Button>
            </div>
          </TabsContent>
        </Tabs>
      </Panel>
    </AppShell>
  );
}
