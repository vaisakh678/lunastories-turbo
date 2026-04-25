import { useAuth, useSignIn } from "@clerk/clerk-react";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Step = "providers" | "email" | "otp";

export function AuthPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("providers");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"apple" | "google" | "email" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded || !signInLoaded) {
    return <Centered>Loading…</Centered>;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleOAuth(strategy: "oauth_apple" | "oauth_google") {
    if (!signIn) return;
    setError(null);
    setBusy(strategy === "oauth_apple" ? "apple" : "google");
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      });
    } catch (err) {
      setError(extractMessage(err));
      setBusy(null);
    }
  }

  async function handleEmailContinue() {
    if (!signIn) return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    setBusy("email");
    try {
      const created = await signIn.create({ identifier: trimmed });
      const factor = created.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      );
      if (!factor || !("emailAddressId" in factor)) {
        throw new Error("Email code not supported for this account");
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
      setStep("otp");
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleVerify() {
    if (!signIn) return;
    if (code.trim().length < 4) return;
    setError(null);
    setBusy("verify");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/", { replace: true });
      } else {
        setError("Couldn't sign in. Try again.");
      }
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-muted/40 flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Milo Tales Admin</CardTitle>
          <CardDescription>
            {step === "otp"
              ? `Enter the code sent to ${email}.`
              : "Sign in to continue."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {step === "providers" && (
            <>
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleOAuth("oauth_apple")}
                disabled={busy !== null}
              >
                {busy === "apple" ? <Loader2 className="size-4 animate-spin" /> : <AppleGlyph />}
                Continue with Apple
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuth("oauth_google")}
                disabled={busy !== null}
              >
                {busy === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleGlyph />}
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 py-1">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-xs uppercase">or</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("email")}
                disabled={busy !== null}
              >
                <Mail className="size-4" />
                Continue with Email
              </Button>
            </>
          )}

          {step === "email" && (
            <>
              <Input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button
                className="w-full"
                onClick={handleEmailContinue}
                disabled={busy !== null || !email.trim()}
              >
                {busy === "email" && <Loader2 className="size-4 animate-spin" />}
                Send code
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("providers");
                  setError(null);
                }}
              >
                Back
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <Input
                type="text"
                autoFocus
                inputMode="numeric"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="123456"
                className="text-center font-mono text-lg tracking-widest"
              />
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={busy !== null || code.trim().length < 4}
              >
                {busy === "verify" && <Loader2 className="size-4 animate-spin" />}
                Verify
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
              >
                Use a different email
              </Button>
            </>
          )}

          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      {children}
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
      <path d="M16.36 1.43c0 1.14-.46 2.27-1.21 3.06-.79.83-2.07 1.46-3.13 1.39-.13-1.12.42-2.27 1.18-3.05.84-.86 2.21-1.5 3.16-1.4zM20.7 17.1c-.6 1.34-.89 1.94-1.66 3.13-1.07 1.65-2.59 3.7-4.46 3.71-1.67.02-2.1-1.1-4.36-1.08-2.27.01-2.74 1.1-4.4 1.08-1.88-.01-3.32-1.86-4.4-3.51C-.43 16.79-.83 11.62 1.13 8.86c1.39-1.96 3.59-3.11 5.65-3.11 2.1 0 3.42 1.16 5.16 1.16 1.69 0 2.72-1.16 5.15-1.16 1.84 0 3.79.99 5.18 2.71-4.55 2.5-3.81 9.07-1.57 8.64z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.43a5.5 5.5 0 0 1-2.39 3.61v3h3.86c2.26-2.08 3.59-5.15 3.59-8.64z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.86-3c-1.07.72-2.45 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.97H1.27v3.13A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.25 14.27a7.2 7.2 0 0 1 0-4.54V6.6H1.27a12 12 0 0 0 0 10.8l3.98-3.13z" />
      <path fill="#EA4335" d="M12 4.78c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.27 6.6l3.98 3.13C6.2 6.9 8.86 4.78 12 4.78z" />
    </svg>
  );
}

function extractMessage(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    const first = errors?.[0];
    if (first) return first.longMessage ?? first.message ?? "Sign in failed";
  }
  if (err instanceof Error) return err.message;
  return "Sign in failed";
}
