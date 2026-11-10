import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { rememberProtectedPath } from "@/lib/auth";
import { migrateLegacyUserData } from "@/lib/carbon";
import { migrateLocalAccountToCloud } from "@/lib/cloud-data";

export function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let generation = 0;
    const unsubscribe = onAuthStateChanged(
      auth,
      (authenticatedUser) => {
        const currentGeneration = ++generation;
        setLoading(true);
        setError(null);
        if (!authenticatedUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        void (async () => {
          try {
            migrateLegacyUserData(authenticatedUser.uid, authenticatedUser.email ?? "");
            await migrateLocalAccountToCloud(authenticatedUser.uid);
            if (active && currentGeneration === generation) {
              setUser(authenticatedUser);
              setLoading(false);
            }
          } catch (syncError) {
            if (active && currentGeneration === generation) {
              setError(syncError instanceof Error ? syncError.message : "Unable to sync account data.");
              setLoading(false);
            }
          }
        })();
      },
      (authError) => {
        if (!active) return;
        setError(authError.message);
        setLoading(false);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

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
