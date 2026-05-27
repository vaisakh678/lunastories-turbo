//
//  PaywallView.swift
//  Luna Stories
//

import RevenueCat
import SwiftUI

struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SubscriptionsViewModel.self) private var subscriptions

    /// Currently selected package id (e.g. `$rc_annual`, `$rc_monthly`).
    /// Defaults to whatever's first in the offering's availablePackages
    /// (we sort annual first when configuring the offering).
    @State private var selectedPackageId: String?
    @State private var isPurchasing: Bool = false
    @State private var isRestoring: Bool = false
    @State private var errorMessage: String?
    @State private var didSucceed: Bool = false

    private var offering: Offering? { subscriptions.offerings?.current }
    private var packages: [Package] { offering?.availablePackages ?? [] }
    private var selectedPackage: Package? {
        guard let id = selectedPackageId else { return packages.first }
        return packages.first { $0.identifier == id } ?? packages.first
    }

    var body: some View {
        NavigationStack {
            ZStack {
                MoodyTwilightBackground()
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    ScrollView {
                        VStack(spacing: 28) {
                            hero
                            featuresList
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                        .padding(.bottom, 24)
                    }
                    plansSection
                        .padding(.horizontal, 24)
                        .padding(.bottom, 12)
                    bottomBar
                }

                if didSucceed {
                    successOverlay
                }
            }
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                    }
                    .accessibilityLabel("Close")
                }
            }
            .task {
                if subscriptions.offerings == nil {
                    await subscriptions.refresh()
                }
                if selectedPackageId == nil {
                    selectedPackageId = packages.first?.identifier
                }
            }
            .alert(
                "Couldn't complete the purchase",
                isPresented: Binding(
                    get: { errorMessage != nil },
                    set: { if !$0 { errorMessage = nil } }
                ),
                actions: { Button("OK") { errorMessage = nil } },
                message: { Text(errorMessage ?? "") }
            )
        }
    }

    // MARK: - Sections

    private var hero: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.32))
                    .frame(width: 180, height: 180)
                    .blur(radius: 40)
                Circle()
                    .fill(Color(red: 0.96, green: 0.73, blue: 0.26).opacity(0.30))
                    .frame(width: 130, height: 130)
                    .blur(radius: 28)

                Image("SplashIcon")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 96, height: 96)
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .strokeBorder(Color.miloCream.opacity(0.12), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.4), radius: 18, x: 0, y: 10)
            }
            .padding(.top, 16)

            VStack(spacing: 6) {
                ProTitleBadge()
                Text("Unlock the full Luna magic")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(Color.miloCream)
                    .multilineTextAlignment(.center)
                Text("Unlimited bedtime stories. Every world. Every night.")
                    .font(.system(size: 15))
                    .foregroundStyle(Color.miloCream.opacity(0.65))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
            }
        }
    }

    private var featuresList: some View {
        VStack(spacing: 12) {
            FeatureRow(
                icon: "infinity",
                title: "Unlimited stories",
                detail: "Generate a fresh tale every single night, never the same twice."
            )
            FeatureRow(
                icon: "headphones",
                title: "10 audio narrations a week",
                detail: "Soothing AI voice, ready in under a minute."
            )
            FeatureRow(
                icon: "books.vertical.fill",
                title: "Every story world",
                detail: "Alice, Oz, Jungle Book, Inventors, Construction, and more."
            )
            FeatureRow(
                icon: "heart.fill",
                title: "Lessons that stick",
                detail: "Pick a moral and Luna weaves it gently into the story."
            )
            FeatureRow(
                icon: "rectangle.dashed.badge.record",
                title: "No ads, ever",
                detail: "Just stories. Designed for bedtime, not for engagement metrics."
            )
        }
    }

    @ViewBuilder
    private var plansSection: some View {
        if subscriptions.isLoading && packages.isEmpty {
            HStack {
                Spacer()
                ProgressView().tint(Color.miloCream)
                Spacer()
            }
            .frame(height: 80)
        } else if packages.isEmpty {
            // No offerings — likely the dev hasn't pushed products to App
            // Store Connect / RevenueCat yet, or RevenueCat couldn't fetch.
            Text("Couldn't load plans. Pull to retry.")
                .font(.subheadline)
                .foregroundStyle(Color.miloCream.opacity(0.6))
                .frame(height: 80)
        } else {
            VStack(spacing: 12) {
                ForEach(packages, id: \.identifier) { pkg in
                    PlanCard(
                        package: pkg,
                        isSelected: pkg.identifier == selectedPackage?.identifier,
                        onTap: { selectedPackageId = pkg.identifier }
                    )
                }
            }
        }
    }

    private var bottomBar: some View {
        VStack(spacing: 10) {
            Button {
                Task { await purchaseSelected() }
            } label: {
                HStack(spacing: 8) {
                    if isPurchasing {
                        ProgressView().tint(Color.miloCream)
                    } else {
                        Text(ctaLabel)
                        Image(systemName: "arrow.right")
                            .font(.system(size: 14, weight: .bold))
                    }
                }
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(Color.miloCream)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    Capsule().fill(
                        LinearGradient(
                            colors: [
                                Color(red: 0.96, green: 0.73, blue: 0.26),
                                Color(red: 0.91, green: 0.35, blue: 0.24),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                )
                .shadow(color: Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.45),
                        radius: 14, x: 0, y: 6)
                .opacity(selectedPackage == nil || isPurchasing ? 0.55 : 1)
            }
            .buttonStyle(.plain)
            .disabled(selectedPackage == nil || isPurchasing)

            Text(footerText)
                .font(.system(size: 12))
                .foregroundStyle(Color.miloCream.opacity(0.5))
                .multilineTextAlignment(.center)

            HStack(spacing: 16) {
                Button {
                    Task { await restorePurchases() }
                } label: {
                    if isRestoring {
                        ProgressView().controlSize(.small).tint(Color.miloCream.opacity(0.5))
                    } else {
                        Text("Restore")
                    }
                }
                .foregroundStyle(Color.miloCream.opacity(0.5))
                .disabled(isRestoring)

                Text("·").foregroundStyle(Color.miloCream.opacity(0.3))
                Link("Terms", destination: LegalLinks.termsURL)
                    .foregroundStyle(Color.miloCream.opacity(0.5))
                Text("·").foregroundStyle(Color.miloCream.opacity(0.3))
                Link("Privacy", destination: LegalLinks.privacyURL)
                    .foregroundStyle(Color.miloCream.opacity(0.5))
            }
            .font(.system(size: 12))
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 16)
        .padding(.top, 12)
    }

    private var successOverlay: some View {
        ZStack {
            Color.black.opacity(0.55).ignoresSafeArea()
            VStack(spacing: 14) {
                Image(systemName: "sparkles")
                    .font(.system(size: 48))
                    .foregroundStyle(Color.accentColor)
                Text("Welcome to Luna Pro ✨")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.miloCream)
                Text("Tonight's stories are on us.")
                    .font(.subheadline)
                    .foregroundStyle(Color.miloCream.opacity(0.7))
            }
            .padding(28)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(.ultraThinMaterial)
            )
        }
        .transition(.opacity)
    }

    // MARK: - CTA copy

    private var ctaLabel: String {
        guard let pkg = selectedPackage else { return "Continue" }
        if let trial = pkg.introFreeTrial {
            return "Start \(trial.trialAdjective) free trial"
        }
        return "Continue"
    }

    private var footerText: String {
        guard let pkg = selectedPackage else { return "Cancel anytime." }
        let price = pkg.storeProduct.localizedPriceString
        let unit = pkg.subscriptionPeriodUnit
        if let trial = pkg.introFreeTrial {
            return "Free for \(trial.trialNoun), then \(price)\(unit). Cancel anytime."
        }
        return "Then \(price)\(unit). Cancel anytime."
    }

    // MARK: - Actions

    private func purchaseSelected() async {
        guard let pkg = selectedPackage else { return }
        isPurchasing = true
        defer { isPurchasing = false }
        do {
            let purchased = try await subscriptions.purchase(package: pkg)
            if purchased {
                withAnimation { didSucceed = true }
                try? await Task.sleep(for: .seconds(1.4))
                dismiss()
            }
        } catch {
            errorMessage = (error as NSError).localizedDescription
        }
    }

    private func restorePurchases() async {
        isRestoring = true
        defer { isRestoring = false }
        do {
            let restored = try await subscriptions.restore()
            if restored {
                withAnimation { didSucceed = true }
                try? await Task.sleep(for: .seconds(1.4))
                dismiss()
            } else {
                errorMessage = "No active Pro subscription found on this Apple ID."
            }
        } catch {
            errorMessage = (error as NSError).localizedDescription
        }
    }
}

// MARK: - Helper extension

private extension Package {
    /// Short cadence label like " / month" / " / year". Falls back to
    /// empty string for non-recurring or unknown periods.
    var subscriptionPeriodUnit: String {
        guard let period = storeProduct.subscriptionPeriod else { return "" }
        switch period.unit {
        case .day: return " / \(period.value > 1 ? "\(period.value) days" : "day")"
        case .week: return " / \(period.value > 1 ? "\(period.value) weeks" : "week")"
        case .month:
            return period.value == 12 ? " / year" : " / \(period.value > 1 ? "\(period.value) months" : "month")"
        case .year: return " / year"
        @unknown default: return ""
        }
    }

    /// "Annual" / "Monthly" / etc — derived from the subscription period
    /// so the card label stays accurate even if the package id changes.
    var displayTitle: String {
        guard let period = storeProduct.subscriptionPeriod else {
            return storeProduct.localizedTitle.isEmpty ? identifier : storeProduct.localizedTitle
        }
        switch period.unit {
        case .year: return "Annual"
        case .month: return period.value == 12 ? "Annual" : "Monthly"
        case .week: return "Weekly"
        case .day: return "Daily"
        @unknown default: return identifier
        }
    }

    var isAnnual: Bool {
        guard let period = storeProduct.subscriptionPeriod else { return false }
        return period.unit == .year || (period.unit == .month && period.value == 12)
    }

    /// The free-trial intro offer period, if this package has one (e.g. the
    /// 7-day trial configured in App Store Connect). nil if there's no trial.
    var introFreeTrial: SubscriptionPeriod? {
        guard let intro = storeProduct.introductoryDiscount,
              intro.paymentMode == .freeTrial else { return nil }
        return intro.subscriptionPeriod
    }
}

private extension SubscriptionPeriod {
    /// Adjective form for badges/CTAs: "7-day", "2-week", "1-month".
    /// A 1-week period is normalized to "7-day" since that reads more naturally.
    var trialAdjective: String {
        switch unit {
        case .day: return "\(value)-day"
        case .week: return value == 1 ? "7-day" : "\(value)-week"
        case .month: return "\(value)-month"
        case .year: return "\(value)-year"
        @unknown default: return "\(value)"
        }
    }

    /// Noun phrase for sentences: "7 days", "2 weeks", "1 month".
    var trialNoun: String {
        switch unit {
        case .day: return "\(value) day\(value == 1 ? "" : "s")"
        case .week: return value == 1 ? "7 days" : "\(value) weeks"
        case .month: return "\(value) month\(value == 1 ? "" : "s")"
        case .year: return "\(value) year\(value == 1 ? "" : "s")"
        @unknown default: return "\(value)"
        }
    }
}

// MARK: - Subviews

private struct ProTitleBadge: View {
    var body: some View {
        Text("LUNA STORIES PRO")
            .font(.system(size: 11, weight: .heavy))
            .tracking(1.2)
            .foregroundStyle(
                LinearGradient(
                    colors: [
                        Color(red: 0.96, green: 0.73, blue: 0.26),
                        Color(red: 0.91, green: 0.45, blue: 0.30),
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
    }
}

private struct FeatureRow: View {
    let icon: String
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.accentColor.opacity(0.18))
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.accentColor)
            }
            .frame(width: 36, height: 36)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.miloCream)
                Text(detail)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.miloCream.opacity(0.6))
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.miloCream.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(Color.miloCream.opacity(0.08), lineWidth: 1)
                )
        )
    }
}

private struct PlanCard: View {
    let package: Package
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .strokeBorder(
                            isSelected ? Color.accentColor : Color.miloCream.opacity(0.25),
                            lineWidth: 2
                        )
                        .frame(width: 22, height: 22)
                    if isSelected {
                        Circle()
                            .fill(Color.accentColor)
                            .frame(width: 12, height: 12)
                    }
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 8) {
                        Text(package.displayTitle)
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                        if package.isAnnual {
                            Text("BEST VALUE")
                                .font(.system(size: 10, weight: .heavy))
                                .tracking(0.6)
                                .foregroundStyle(Color.miloCream)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule().fill(Color.accentColor)
                                )
                        }
                    }
                    if let trial = package.introFreeTrial {
                        Text("\(trial.trialAdjective.uppercased()) FREE TRIAL")
                            .font(.system(size: 10, weight: .heavy))
                            .tracking(0.5)
                            .foregroundStyle(Color.accentColor)
                    }
                    Text(subnote)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.miloCream.opacity(0.6))
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: 0) {
                    Text(package.storeProduct.localizedPriceString)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(Color.miloCream)
                    Text(package.subscriptionPeriodUnit.replacingOccurrences(of: " / ", with: "/ "))
                        .font(.system(size: 11))
                        .foregroundStyle(Color.miloCream.opacity(0.55))
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(Color.miloCream.opacity(isSelected ? 0.10 : 0.04))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(
                        isSelected ? Color.accentColor : Color.miloCream.opacity(0.10),
                        lineWidth: isSelected ? 1.75 : 1
                    )
            )
            .shadow(
                color: Color.black.opacity(isSelected ? 0.35 : 0.22),
                radius: isSelected ? 18 : 12,
                x: 0,
                y: isSelected ? 10 : 6
            )
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.18), value: isSelected)
    }

    private var subnote: String {
        if package.isAnnual {
            return "Save vs monthly · cancel anytime"
        }
        return "Cancel anytime"
    }
}
