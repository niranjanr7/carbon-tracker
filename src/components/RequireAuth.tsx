import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { rememberProtectedPath } from "@/lib/auth";
import { migrateLegacyUserData } from "@/lib/carbon";

export function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(
    auth,
    (authenticatedUser) => {
      if (authenticatedUser) {
        try {
          migrateLegacyUserData(authenticatedUser.uid, authenticatedUser.email ?? "");
        } catch (migrationError) {
          setError(migrationError instanceof Error ? migrationError.message : "Unable to load account data.");
          setLoading(false);
          return;
        }
      }
      setUser(authenticatedUser);
      setLoading(false);
    },
    (authError) => {
      setError(authError.message);
      setLoading(false);
    },
  ), []);

  useEffect(() => {
    if (!loading && !error && !user) {
      rememberProtectedPath(pathname);
      void navigate({ to: "/login", replace: true });
    }
  }, [error, loading, navigate, pathname, user]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div role="alert" className="max-w-md text-center">
          <p className="font-semibold">Unable to verify your sign-in.</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link to="/login" className="mt-4 inline-block text-primary underline">Go to login</Link>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking your sign-in…</div>;
  }

  return children;
}
