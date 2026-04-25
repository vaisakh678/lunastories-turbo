import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export function SsoCallbackPage() {
  return (
    <div className="flex h-full items-center justify-center text-gray-500">
      Signing you in…
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
