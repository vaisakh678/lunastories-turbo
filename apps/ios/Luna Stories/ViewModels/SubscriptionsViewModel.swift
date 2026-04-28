//
//  SubscriptionsViewModel.swift
//  Luna Stories
//
//  Holds the RevenueCat-backed subscription state at app scope so any
//  screen can read `isPro` (gating Pro features) and the paywall can
//  render live offerings + dispatch real purchases.
//
//  The "pro" entitlement identifier matches what's configured in the
//  RevenueCat dashboard (Project Settings → Entitlements → "pro").
//  Both the monthly and annual products grant this entitlement.
//

import Foundation
import Observation
import RevenueCat

@Observable
@MainActor
final class SubscriptionsViewModel {
    private(set) var isPro: Bool = false
    private(set) var offerings: Offerings?
    private(set) var isLoading: Bool = false
    var errorMessage: String?

    /// Identifier configured in RevenueCat dashboard.
    private static let proEntitlement = "pro"

    /// Refresh both offerings (what to show in the paywall) and the
    /// current customer info (whether they have the pro entitlement).
    func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }

        async let offeringsResult = fetchOfferings()
        async let customerResult = fetchCustomerInfo()
        offerings = await offeringsResult
        if let info = await customerResult {
            isPro = info.entitlements[Self.proEntitlement]?.isActive == true
        }
    }

    /// Attempt a purchase. Returns true if the user now has pro access
    /// (purchase completed AND entitlement is active). False if cancelled
    /// or pending (e.g. ask-to-buy / parental approval).
    @discardableResult
    func purchase(package: Package) async throws -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        if result.userCancelled { return false }
        let active = result.customerInfo.entitlements[Self.proEntitlement]?.isActive == true
        isPro = active
        return active
    }

    /// Restore purchases. Required by Apple. Returns true if the restored
    /// account has the pro entitlement, false otherwise.
    @discardableResult
    func restore() async throws -> Bool {
        let info = try await Purchases.shared.restorePurchases()
        let active = info.entitlements[Self.proEntitlement]?.isActive == true
        isPro = active
        return active
    }

    // MARK: - Helpers

    private func fetchOfferings() async -> Offerings? {
        do {
            return try await Purchases.shared.offerings()
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    private func fetchCustomerInfo() async -> CustomerInfo? {
        do {
            return try await Purchases.shared.customerInfo()
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }
}
