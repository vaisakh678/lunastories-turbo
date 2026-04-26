import { useAuth, useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { AdminStatsDTO } from "@repo/dto";
import { ShieldOff } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/http";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  const probe = useQuery({
    queryKey: ["admin-probe"],
    queryFn: () => apiGet<AdminStatsDTO>("/api/v1/admin/stats"),
    enabled: isLoaded && isSignedIn,
    retry: false,
  });

  if (!isLoaded || (isSignedIn && probe.isLoading)) {
    return <Centered label="Checking access…" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (probe.isError) {
    return <NoAccess />;
  }

  return <>{children}</>;
}

function Centered({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
      {label}
    </div>
  );
}

function NoAccess() {
  const { signOut } = useClerk();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldOff className="text-muted-foreground size-12" />
      <div>
        <h1 className="text-2xl font-bold">No admin access</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your account is signed in but doesn't have admin privileges.
        </p>
      </div>
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
