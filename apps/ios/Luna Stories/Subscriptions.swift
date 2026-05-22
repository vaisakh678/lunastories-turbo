//
//  Subscriptions.swift
//  Luna Stories
//
//  RevenueCat integration. Owns:
//    - SDK initialization at app launch
//    - aliasing the RevenueCat App User Id to the backend internal user
//      id, so subscription state follows the user across reinstalls and
//      devices (and matches the OneSignal external_id for backend joins)
//    - logout on Clerk sign-out
//
//  REQUIRED ONE-TIME XCODE SETUP:
//   1. File → Add Package Dependencies → https://github.com/RevenueCat/purchases-ios.git
//      (already added; package reference is in pbxproj)
//   2. Project → Target Luna Stories → General → Frameworks, Libraries,
//      and Embedded Content → + → add `RevenueCat` product to the target.
//      Without this, the import below won't resolve.
//

import Foundation
import RevenueCat

enum Subscriptions {
    /// Call once during app launch (in `Luna_StoriesApp.init`).
    static func configure() {
        Purchases.logLevel = .info
        Purchases.configure(withAPIKey: Config.revenueCatAPIKey)
    }

    /// Tie the RevenueCat App User Id to the backend internal user id so
    /// subscription state follows the user across reinstalls + devices
    /// and matches the OneSignal external_id for cross-system joins.
    static func login(userId: String) async {
        do {
            print("💳 RevenueCat.logIn(\(userId))")
            _ = try await Purchases.shared.logIn(userId)
        } catch {
            print("💳 RevenueCat.logIn failed: \(error)")
        }
    }

    static func logout() async {
        print("💳 RevenueCat.logOut()")
        do {
            _ = try await Purchases.shared.logOut()
        } catch {
            print("💳 RevenueCat.logOut failed: \(error)")
        }
    }

    /// Opens the App Store's subscription management sheet. The user can
    /// cancel / change plan / restore from there. If the user has no
    /// active subscription, App Store still shows the "no subscriptions"
    /// screen rather than failing.
    static func manage() async {
        do {
            try await Purchases.shared.showManageSubscriptions()
        } catch {
            print("💳 RevenueCat.showManageSubscriptions failed: \(error)")
        }
    }
}
