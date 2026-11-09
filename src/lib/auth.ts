export type ProtectedPath = "/calculator" | "/dashboard";

const RETURN_TO_KEY = "carbontracker.authReturnTo";

export function rememberProtectedPath(pathname: string) {
  const path: ProtectedPath = pathname === "/calculator" ? "/calculator" : "/dashboard";
  sessionStorage.setItem(RETURN_TO_KEY, path);
}

export function consumeProtectedPath(): ProtectedPath {
  const path = sessionStorage.getItem(RETURN_TO_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
  return path === "/calculator" ? "/calculator" : "/dashboard";
}
