//
//  PushNotifications.swift
//  Luna Stories
//
//  OneSignal v5 integration. Owns:
//    - SDK initialization at app launch
//    - permission request (lazy — first time the user starts a generation)
//    - aliasing the OneSignal subscription to the Clerk user id so the
//      backend can target this specific user
//    - tap handler that extracts a story id from the notification payload
//      and routes through DeepLinkRouter so HomeView can push the reader
//
//  REQUIRED ONE-TIME XCODE SETUP (won't compile until step 1 is done):
//   1. File → Add Package Dependencies → https://github.com/OneSignal/OneSignal-iOS-SDK
//      → choose 5.x range. Add OneSignalFramework, OneSignalExtension,
//      OneSignalInAppMessages, OneSignalLocation, OneSignalNotifications,
//      and OneSignalUser products to the Luna Stories target.
//   2. Target → Signing & Capabilities → +Capability → Push Notifications.
//   3. Target → Signing & Capabilities → +Capability → Background Modes
//      → check "Remote notifications".
//   4. (Optional, recommended) File → New → Target → Notification Service
//      Extension. Add OneSignalExtension to that new target. Replace the
//      generated NotificationService.swift body with OneSignal's template.
//

import Foundation
import OneSignalFramework

enum PushNotifications {
    /// Call once during app launch (in `Luna_StoriesApp.init`).
    static func configure(
        router: DeepLinkRouter,
        latestStory: LatestStoryViewModel
    ) {
        // Verbose during dev; switch to .LL_WARN before release.
        OneSignal.Debug.setLogLevel(.LL_VERBOSE)
        OneSignal.initialize(Config.oneSignalAppId, withLaunchOptions: nil)

        // Tap handler — fires when the user taps a notification (whether
        // app was foreground, background, or terminated).
        OneSignal.Notifications.addClickListener(
            NotificationClickHandler(router: router)
        )

        // Foreground lifecycle — when a "story ready" push arrives while
        // the app is open, suppress the OS banner (the in-app one is
        // already going to show it) and refresh the LatestStoryViewModel
        // so the banner morphs to "Pick up where you left off"
        // immediately instead of waiting for the 5s poll.
        OneSignal.Notifications.addForegroundLifecycleListener(
            NotificationForegroundHandler(latestStory: latestStory)
        )
    }

    /// Ask the OS for permission. Call lazily (on first generate-story tap)
    /// so we don't ambush the user on first launch.
    static func requestPermissionIfNeeded() {
        OneSignal.Notifications.requestPermission({ _ in }, fallbackToSettings: false)
    }

    /// Tie the OneSignal subscription to a stable user id so the backend
    /// can target this user across reinstalls and devices.
    static func login(userId: String) {
        print("🔔 OneSignal.login(\(userId))")
        OneSignal.login(userId)
    }

    static func logout() {
        print("🔔 OneSignal.logout()")
        OneSignal.logout()
    }
}

/// OneSignal v5 click-listener trampoline. The SDK requires an object,
/// not a closure, so we wrap the router reference.
private final class NotificationClickHandler: NSObject, OSNotificationClickListener {
    let router: DeepLinkRouter

    init(router: DeepLinkRouter) {
        self.router = router
    }

    func onClick(event: OSNotificationClickEvent) {
        let payload = event.notification.additionalData
        print("📬 OneSignal click — additionalData: \(String(describing: payload))")
        // Backend includes `{"storyId": "<uuid>"}` in additionalData when
        // story generation finishes. Anything else is treated as a generic
        // notification and just brings the app to the foreground.
        guard let storyId = payload?["storyId"] as? String else {
            print("📬 No storyId in payload — bringing app to foreground only")
            return
        }
        print("📬 Routing deep link to story: \(storyId)")
        Task { @MainActor in
            router.openStory(id: storyId)
        }
    }
}

/// Suppresses foreground OS-banner notifications (the in-app banner is
/// the better surface) and pokes the LatestStoryViewModel so it updates
/// instantly rather than waiting for the next poll tick.
private final class NotificationForegroundHandler: NSObject,
    OSNotificationLifecycleListener
{
    let latestStory: LatestStoryViewModel

    init(latestStory: LatestStoryViewModel) {
        self.latestStory = latestStory
    }

    func onWillDisplay(event: OSNotificationWillDisplayEvent) {
        let payload = event.notification.additionalData
        print("📬 OneSignal foreground — additionalData: \(String(describing: payload))")
        // Suppress the OS banner — the in-app banner already shows this.
        event.preventDefault()
        Task { @MainActor in
            await latestStory.refresh()
        }
    }
}
