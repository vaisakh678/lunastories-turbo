//
//  AccountView.swift
//  Milo Tales
//

import SwiftUI
import ClerkKit

struct AccountView: View {
    @Environment(Clerk.self) private var clerk
    @State private var confirmingLogout: Bool = false
    @State private var isLoggingOut: Bool = false
    @State private var errorMessage: String?
    @State private var showPaywall: Bool = false

    private var greeting: String {
        if let name = clerk.user?.firstName, !name.isEmpty {
            return "Hello, \(name)"
        }
        return "Hello, Storyteller"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 14) {
                    ZStack {
                        // Soft warm halo behind the avatar, echoing the splash.
                        Circle()
                            .fill(Color.accentColor.opacity(0.32))
                            .frame(width: 140, height: 140)
                            .blur(radius: 28)
                        Circle()
                            .fill(Color.accentColor.opacity(0.18))
                            .frame(width: 96, height: 96)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.system(size: 40, weight: .semibold))
                                    .foregroundStyle(.tint)
                            )
                            .overlay(
                                Circle()
                                    .strokeBorder(Color.miloCream.opacity(0.12), lineWidth: 1)
                            )
                    }
                    VStack(spacing: 4) {
                        Text(greeting)
                            .font(.title3.weight(.semibold))
                        Text("Manage your profile")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.top, 12)

                VStack(spacing: 0) {
                    NavigationLink {
                        MyStoriesView()
                    } label: {
                        MenuRowLabel(icon: "book.fill", title: "My Stories")
                    }
                    .buttonStyle(.plain)
                    SoftDivider()
                    Button {
                        showPaywall = true
                    } label: {
                        MenuRowLabel(icon: "star.circle.fill", title: "Subscribe")
                    }
                    .buttonStyle(.plain)
                    SoftDivider()
                    NavigationLink {
                        SettingsView()
                    } label: {
                        MenuRowLabel(icon: "gearshape.fill", title: "Settings")
                    }
                    .buttonStyle(.plain)
                    SoftDivider()
                    Button {} label: {
                        MenuRowLabel(icon: "gift.fill", title: "Share and Earn")
                    }
                    .buttonStyle(.plain)
                    SoftDivider()
                    NavigationLink {
                        FeedbackView()
                    } label: {
                        MenuRowLabel(icon: "bubble.left.fill", title: "Send Feedback")
                    }
                    .buttonStyle(.plain)
                }
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.miloCream.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .strokeBorder(Color.miloCream.opacity(0.08), lineWidth: 1)
                        )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)

                Button {
                    confirmingLogout = true
                } label: {
                    MenuRowLabel(
                        icon: "rectangle.portrait.and.arrow.right",
                        title: "Logout",
                        tint: .red,
                        isLoading: isLoggingOut
                    )
                }
                .buttonStyle(.plain)
                .disabled(isLoggingOut)
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.miloCream.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .strokeBorder(Color.miloCream.opacity(0.08), lineWidth: 1)
                        )
                )
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 20)
        }
        .background(MoodyTwilightBackground().ignoresSafeArea())
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showPaywall = true
                } label: {
                    ProBadge()
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Upgrade to Pro")
            }
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
        }
        .alert(
            "Are you sure you want to logout?",
            isPresented: $confirmingLogout
        ) {
            Button("Cancel", role: .cancel) {}
            Button("Logout", role: .destructive) {
                Task { await handleLogout() }
            }
        }
        .alert(
            "Sign out failed",
            isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            ),
            actions: { Button("OK") { errorMessage = nil } },
            message: { Text(errorMessage ?? "") }
        )
        .animation(.easeInOut(duration: 0.2), value: isLoggingOut)
    }

    private func handleLogout() async {
        isLoggingOut = true
        defer { isLoggingOut = false }
        do {
            try await Clerk.shared.auth.signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct ProBadge: View {
    var body: some View {
        Text("PRO")
            .font(.system(size: 12, weight: .heavy))
            .tracking(0.6)
            .foregroundStyle(Color.miloCream)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
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
            .overlay(
                Capsule()
                    .strokeBorder(Color.miloCream.opacity(0.20), lineWidth: 0.75)
            )
            .shadow(color: Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.4),
                    radius: 6, x: 0, y: 3)
    }
}

private struct MenuRowLabel: View {
    let icon: String
    let title: String
    var tint: Color = .primary
    var isLoading: Bool = false

    private var iconTint: Color {
        tint == .primary ? Color.accentColor : tint
    }

    var body: some View {
        HStack(spacing: 14) {
            // Tinted "chip" behind each icon for visual rhythm matching the
            // tile aesthetic used elsewhere in the app.
            ZStack {
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(iconTint.opacity(0.18))
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(iconTint)
            }
            .frame(width: 32, height: 32)

            Text(title)
                .font(.body)
                .foregroundStyle(tint)
            Spacer()
            if isLoading {
                ProgressView()
                    .controlSize(.small)
                    .foregroundStyle(tint)
                    .tint(tint)
            } else {
                Image(systemName: "chevron.right")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

private struct SoftDivider: View {
    var body: some View {
        Rectangle()
            .fill(Color.miloCream.opacity(0.08))
            .frame(height: 1)
            .padding(.leading, 62)
    }
}
