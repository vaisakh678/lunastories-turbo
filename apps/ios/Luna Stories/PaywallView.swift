//
//  PaywallView.swift
//  Luna Stories
//

import SwiftUI

struct PaywallView: View {
    enum Plan: Hashable {
        case monthly
        case annual
    }

    @Environment(\.dismiss) private var dismiss
    @State private var selectedPlan: Plan = .annual

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
                    plans
                        .padding(.horizontal, 24)
                        .padding(.bottom, 12)
                    bottomBar
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
        }
    }

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
                Text("Unlock the full Milo magic")
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
                detail: "Pick a moral and Milo weaves it gently into the story."
            )
            FeatureRow(
                icon: "rectangle.dashed.badge.record",
                title: "No ads, ever",
                detail: "Just stories. Designed for bedtime, not for engagement metrics."
            )
        }
    }

    private var plans: some View {
        VStack(spacing: 12) {
            PlanCard(
                title: "Annual",
                price: "$59.99",
                cadence: "/ year",
                subnote: "$5.00 / month — save 30%",
                badge: "Best value",
                isSelected: selectedPlan == .annual,
                onTap: { selectedPlan = .annual }
            )
            PlanCard(
                title: "Monthly",
                price: "$6.99",
                cadence: "/ month",
                subnote: "Cancel anytime",
                badge: nil,
                isSelected: selectedPlan == .monthly,
                onTap: { selectedPlan = .monthly }
            )
        }
    }

    private var bottomBar: some View {
        VStack(spacing: 10) {
            Button {
                // TODO: wire up StoreKit purchase for selectedPlan.
            } label: {
                HStack(spacing: 8) {
                    Text("Start 7-day free trial")
                    Image(systemName: "arrow.right")
                        .font(.system(size: 14, weight: .bold))
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
            }
            .buttonStyle(.plain)

            Text("Then \(selectedPlan == .annual ? "$59.99 / year" : "$6.99 / month"). Cancel anytime.")
                .font(.system(size: 12))
                .foregroundStyle(Color.miloCream.opacity(0.5))

            HStack(spacing: 16) {
                Button("Terms") {}
                    .foregroundStyle(Color.miloCream.opacity(0.5))
                Text("·")
                    .foregroundStyle(Color.miloCream.opacity(0.3))
                Button("Privacy") {}
                    .foregroundStyle(Color.miloCream.opacity(0.5))
            }
            .font(.system(size: 12))
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 16)
        .padding(.top, 12)
    }
}

private struct ProTitleBadge: View {
    var body: some View {
        Text("MILO TALES PRO")
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
    let title: String
    let price: String
    let cadence: String
    let subnote: String
    let badge: String?
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
                        Text(title)
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                        if let badge {
                            Text(badge.uppercased())
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
                    Text(subnote)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.miloCream.opacity(0.6))
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: 0) {
                    Text(price)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(Color.miloCream)
                    Text(cadence)
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
}
