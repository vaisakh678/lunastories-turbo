import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { AdminStatsDTO } from "@repo/dto";
import { Navigate, useLocation } from "react-router-dom";

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
    return <CenteredSpinner label="Checking access…" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (probe.isError) {
    return <NoAccess />;
  }

  return <>{children}</>;
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-gray-500">
      {label}
    </div>
  );
}

function NoAccess() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-700">
      <h1 className="text-2xl font-semibold">No admin access</h1>
      <p className="text-sm text-gray-500">
        Your account is signed in but doesn't have admin privileges.
      </p>
    </div>
  );
}
