//
//  Analytics.swift
//  Luna Stories
//
//  PostHog analytics. Gated behind `Config.posthogEnabled` (YES only in
//  Prod.xcconfig) so debug/dev builds stay out of the single PostHog project.
//  Owns SDK init at app launch and identify/reset on Clerk sign-in / sign-out,
//  keyed by the backend user id (the same id RevenueCat + OneSignal use) so a
//  person's events line up across services. Mirrors Android Analytics.kt.
//
//  The whole implementation is wrapped in `#if canImport(PostHog)` so the app
//  still compiles before the Swift Package is added in Xcode (the calls become
//  no-ops). Add the package via:
//    File ▸ Add Package Dependencies… ▸ https://github.com/PostHog/posthog-ios
//    (Up to Next Major, from 3.56.0)
//

import Foundation
#if canImport(PostHog)
import PostHog
#endif

enum Analytics {
    static func configure() {
        #if canImport(PostHog)
        guard Config.posthogEnabled, !Config.posthogAPIKey.isEmpty else { return }
        let config = PostHogConfig(apiKey: Config.posthogAPIKey, host: Config.posthogHost)
        config.captureScreenViews = true
        config.captureApplicationLifecycleEvents = true
        PostHogSDK.shared.setup(config)
        #endif
    }

    /// Tie events to the backend user id once we know it (post sign-in).
    static func identify(_ userId: String) {
        #if canImport(PostHog)
        guard Config.posthogEnabled else { return }
        PostHogSDK.shared.identify(userId)
        #endif
    }

    /// Drop the identified user on sign-out so the next user starts clean.
    static func reset() {
        #if canImport(PostHog)
        guard Config.posthogEnabled else { return }
        PostHogSDK.shared.reset()
        #endif
    }

    static func capture(_ event: String, properties: [String: Any]? = nil) {
        #if canImport(PostHog)
        guard Config.posthogEnabled else { return }
        PostHogSDK.shared.capture(event, properties: properties)
        #endif
    }
}
