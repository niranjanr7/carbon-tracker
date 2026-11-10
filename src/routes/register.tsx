import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { setUser } from "@/lib/carbon";
import { seo } from "@/lib/seo";
import { auth } from "@/lib/firebase";
import { consumeProtectedPath } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => seo("Register", "Create your CarbonTracker account and join a greener future."),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pw: "", pw2: "" });
  const [loading, setLoading] = useState(false);
  return (
    <AuthCard title="Create Your Account" subtitle="Join us in building a greener future">
      <form className="space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        if (f.pw !== f.pw2) { toast.error("Passwords don't match"); return; }
        setLoading(true);
        const email = f.email.trim().toLowerCase();
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, f.pw);
          await updateProfile(credential.user, { displayName: f.name });
          await setUser({ name: f.name, email, joined: new Date().toISOString().slice(0, 10) });
          toast.success("Account created");
          await nav({ to: consumeProtectedPath() });
        } catch (error) {
          const message = error instanceof FirebaseError
            ? error.code === "auth/email-already-in-use"
              ? "An account already exists for this email. Please log in."
              : error.code === "auth/operation-not-allowed"
                ? "Email/password registration is not enabled for this Firebase project."
                : `Unable to create account: ${error.message}`
            : "Unable to create account. Please try again.";
          toast.error(message);
        } finally {
          setLoading(false);
        }
      }}>
        <div><Label>Full Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Email Address</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><Label>Password</Label><Input type="password" required minLength={6} value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} /></div>
        <div><Label>Confirm Password</Label><Input type="password" required value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} /></div>
        <Button className="w-full" type="submit" disabled={loading}>{loading ? "Creating account…" : "Register"}</Button>
        <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
      </form>
    </AuthCard>
  );
}
