import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { setUser } from "@/lib/carbon";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/register")({
  head: () => seo("Register", "Create your CarbonTracker account and join a greener future."),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  return (
    <AuthCard title="Create Your Account" subtitle="Join us in building a greener future">
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault();
        if (f.pw !== f.pw2) { toast.error("Passwords don't match"); return; }
        setUser({ name: f.name, email: f.email, joined: new Date().toISOString().slice(0, 10) });
        toast.success("Account created");
        nav({ to: "/dashboard" });
      }}>
        <div><Label>Full Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Email Address</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} /></div>
        <div><Label>Confirm Password</Label><Input type="password" required value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} /></div>
        <Button className="w-full" type="submit">Register</Button>
        <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
      </form>
    </AuthCard>
  );
}
