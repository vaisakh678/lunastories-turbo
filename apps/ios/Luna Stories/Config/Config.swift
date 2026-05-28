//
//  Config.swift
//  Luna Stories
//
//  Reads per-environment values that the active xcconfig sets as build settings,
//  which Info.plist references via `$(NAME)` substitution.
//
//  Both the type and the property are marked `nonisolated` because the project
//  has `SWIFT_DEFAULT_ACTOR_ISOLATION = MainActor`, which would otherwise force
//  @MainActor isolation and break synchronous reads from `actor` consumers
//  (APIClient).
//

import Foundation

nonisolated enum Config {
    /// Base URL of the API, e.g. `http://localhost:3001`. Path callers
    /// (e.g. `APIClient.get("/api/v1/avatars")`) include `/api/v1` themselves.
    nonisolated static var apiBaseURL: String {
        guard let value = Bundle.main.infoDictionary?["API_BASE_URL"] as? String,
              !value.isEmpty else {
            fatalError("Missing API_BASE_URL — check that the active build configuration links a Config/*.xcconfig and that Info.plist references $(API_BASE_URL)")
        }
        return value
    }

    /// OneSignal app id (UUID) for the active environment. Sourced from
    /// `ONESIGNAL_APP_ID` in the per-env xcconfig.
    nonisolated static var oneSignalAppId: String {
        guard let value = Bundle.main.infoDictionary?["ONESIGNAL_APP_ID"] as? String,
              !value.isEmpty else {
            fatalError("Missing ONESIGNAL_APP_ID — check that the active build configuration links a Config/*.xcconfig and that Info.plist references $(ONESIGNAL_APP_ID)")
        }
        return value
    }

    /// RevenueCat public iOS SDK key (`appl_…`). Used to configure the
    /// Purchases SDK at app launch. Sourced from `REVENUECAT_API_KEY` in
    /// the per-env xcconfig.
    nonisolated static var revenueCatAPIKey: String {
        guard let value = Bundle.main.infoDictionary?["REVENUECAT_API_KEY"] as? String,
              !value.isEmpty else {
            fatalError("Missing REVENUECAT_API_KEY — check that the active build configuration links a Config/*.xcconfig and that Info.plist references $(REVENUECAT_API_KEY)")
        }
        return value
    }

    /// Clerk publishable key (`pk_test_…` / `pk_live_…`) for the active
    /// environment. Sourced from `CLERK_PUBLISHABLE_KEY` in the per-env xcconfig.
    nonisolated static var clerkPublishableKey: String {
        guard let value = Bundle.main.infoDictionary?["CLERK_PUBLISHABLE_KEY"] as? String,
              !value.isEmpty else {
            fatalError("Missing CLERK_PUBLISHABLE_KEY — check that the active build configuration links a Config/*.xcconfig and that Info.plist references $(CLERK_PUBLISHABLE_KEY)")
        }
        return value
    }

    /// Whether PostHog analytics is enabled for the active environment.
    /// Sourced from `POSTHOG_ENABLED` (YES only in Prod.xcconfig). Unlike the
    /// keys above this never fatalErrors — a missing/false value just means
    /// "disabled", so debug/dev builds stay out of the PostHog project.
    nonisolated static var posthogEnabled: Bool {
        let value = Bundle.main.infoDictionary?["POSTHOG_ENABLED"] as? String
        return value == "YES" || value == "true" || value == "1"
    }

    /// PostHog public (write-only) project token. Sourced from
    /// `POSTHOG_API_KEY`. Empty when unset — callers guard on `posthogEnabled`.
    nonisolated static var posthogAPIKey: String {
        Bundle.main.infoDictionary?["POSTHOG_API_KEY"] as? String ?? ""
    }

    /// PostHog ingestion host. Sourced from `POSTHOG_HOST`, defaulting to US
    /// cloud when unset.
    nonisolated static var posthogHost: String {
        let value = Bundle.main.infoDictionary?["POSTHOG_HOST"] as? String ?? ""
        return value.isEmpty ? "https://us.i.posthog.com" : value
    }
}
