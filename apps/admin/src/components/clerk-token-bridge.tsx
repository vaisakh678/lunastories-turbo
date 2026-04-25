import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";

import { setTokenProvider } from "@/lib/http";

export function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  return null;
}
