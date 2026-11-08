import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Login", "Log in to your CarbonTracker account."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  return (
    <AuthCard title="Welcome Back" subtitle="Login to your account">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nav({ to: "/dashboard" }); }}>
        <div><Label>Email Address</Label><Input type="email" required placeholder="Enter your email" /></div>
        <div><Label>Password</Label><Input type="password" required placeholder="Enter your password" /></div>
        <Button className="w-full" type="submit">Login</Button>
        <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
      </form>
    </AuthCard>
  );
}
