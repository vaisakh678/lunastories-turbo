import { createStore, useStore } from '@/lib/store';

// Mock auth service standing in for Clerk (@clerk/clerk-expo lands in the
// dev-build phase). Same surface the iOS AuthFlowModel exposes: email OTP
// two-step, Apple, Google — all resolve to a signed-in session here.

export interface AuthState {
  isSignedIn: boolean;
  /** True while restoring the persisted session at launch (splash gate). */
  isLoading: boolean;
}

export const authStore = createStore<AuthState>({ isSignedIn: false, isLoading: false });

export function useAuth(): AuthState {
  return useStore(authStore);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const auth = {
  async sendEmailCode(_email: string): Promise<void> {
    await wait(700);
  },
  async verifyEmailCode(code: string): Promise<void> {
    await wait(700);
    if (code.length !== 6) throw new Error("That code doesn't look right. Try again.");
    authStore.set({ isSignedIn: true, isLoading: false });
  },
  async signInWithApple(): Promise<void> {
    await wait(900);
    authStore.set({ isSignedIn: true, isLoading: false });
  },
  async signInWithGoogle(): Promise<void> {
    await wait(900);
    authStore.set({ isSignedIn: true, isLoading: false });
  },
  async signOut(): Promise<void> {
    await wait(300);
    authStore.set({ isSignedIn: false, isLoading: false });
  },
};
