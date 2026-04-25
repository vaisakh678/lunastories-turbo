import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export function SsoCallbackPage() {
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 text-sm">
      <Loader2 className="size-6 animate-spin" />
      <span>Signing you in…</span>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
