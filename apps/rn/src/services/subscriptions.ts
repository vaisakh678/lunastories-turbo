import { createStore, useStore } from '@/lib/store';

// Mock subscriptions service standing in for RevenueCat
// (react-native-purchases needs a dev build). Mirrors the surface of the
// iOS SubscriptionsViewModel: offerings, isPro, purchase, restore, and
// per-package trial eligibility.

export interface SubscriptionPackage {
  identifier: string; // e.g. "$rc_annual"
  title: 'Annual' | 'Monthly';
  priceString: string;
  periodUnit: ' / year' | ' / month';
  isAnnual: boolean;
  /** Free-trial length in days, when the package has an intro offer. */
  trialDays?: number;
}

export interface SubscriptionsState {
  isPro: boolean;
  packages: SubscriptionPackage[];
  /** product id -> eligible; ineligible users see plain pricing copy. */
  trialEligibility: Record<string, boolean>;
}

export const subscriptionsStore = createStore<SubscriptionsState>({
  isPro: false,
  packages: [
    {
      identifier: '$rc_annual',
      title: 'Annual',
      priceString: '₹2,999',
      periodUnit: ' / year',
      isAnnual: true,
      trialDays: 7,
    },
    {
      identifier: '$rc_monthly',
      title: 'Monthly',
      priceString: '₹399',
      periodUnit: ' / month',
      isAnnual: false,
    },
  ],
  trialEligibility: { $rc_annual: true, $rc_monthly: true },
});

export function useSubscriptions(): SubscriptionsState {
  return useStore(subscriptionsStore);
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const subscriptions = {
  async purchase(pkg: SubscriptionPackage): Promise<boolean> {
    await wait(1200);
    subscriptionsStore.set((s) => ({ ...s, isPro: true }));
    return true;
  },
  async restore(): Promise<boolean> {
    await wait(900);
    return subscriptionsStore.get().isPro;
  },
};
