import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { seo } from "@/lib/seo";
import { auth } from "@/lib/firebase";
import { consumeProtectedPath } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => seo("Login", "Log in to your CarbonTracker account."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthCard title="Welcome Back" subtitle="Login to your account">
      <form className="space-y-4" onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        try {
          await signInWithEmailAndPassword(
            auth,
            String(formData.get("email")),
            String(formData.get("password")),
          );
          toast.success("Login successful");
          await nav({ to: consumeProtectedPath() });
        } catch (error) {
          const message = error instanceof FirebaseError
            ? error.code === "auth/invalid-credential"
              ? "Email or password is incorrect."
              : error.code === "auth/operation-not-allowed"
                ? "Email/password sign-in is not enabled for this Firebase project."
                : `Unable to log in: ${error.message}`
            : "Unable to log in. Please try again.";
          toast.error(message);
        } finally {
          setLoading(false);
        }
      }}>
        <div><Label htmlFor="login-email">Email Address</Label><Input id="login-email" name="email" type="email" required placeholder="Enter your email" /></div>
        <div><Label htmlFor="login-password">Password</Label><Input id="login-password" name="password" type="password" required placeholder="Enter your password" /></div>
        <Button className="w-full" type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</Button>
        <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
      </form>
    </AuthCard>
  );
}
