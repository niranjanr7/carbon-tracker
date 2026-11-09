import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser, setUser, type User } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/profile")({
  head: () => seo("Profile", "Update your information and account settings."),
  component: Profile,
});

function Profile() {
  const [u, setU] = useState<User>({ name: "", email: "", joined: "" });
  useEffect(() => setU(getUser()), []);
  return (
    <AppShell title="User Profile" subtitle="Update your information and account settings.">
      <Panel className="w-full">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">{u.name.charAt(0)}</div>
          <div><p className="font-semibold">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setUser(u); toast.success("Profile saved"); }}>
          <div><Label>Full Name</Label><Input value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} /></div>
          <div><Label>Email Address</Label><Input type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></div>
          <p className="text-sm text-muted-foreground">Joined: {u.joined}</p>
          <Button type="submit">Save Profile</Button>
        </form>
      </Panel>
    </AppShell>
  );
}
