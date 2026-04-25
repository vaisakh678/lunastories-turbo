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

    private var greeting: String {
        if let name = clerk.user?.firstName, !name.isEmpty {
            return "Hello, \(name)"
        }
        return "Hello, Storyteller"
    }

    var body: some View {
        ZStack {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Circle()
                        .fill(Color.accentColor.opacity(0.18))
                        .frame(width: 96, height: 96)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.system(size: 40, weight: .semibold))
                                .foregroundStyle(.tint)
                        )
                    VStack(spacing: 2) {
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
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "star.circle.fill", title: "Subscribe")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    NavigationLink {
                        SettingsView()
                    } label: {
                        MenuRowLabel(icon: "gearshape.fill", title: "Settings")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "gift.fill", title: "Share and Earn")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    NavigationLink {
                        FeedbackView()
                    } label: {
                        MenuRowLabel(icon: "bubble.left.fill", title: "Send Feedback")
                    }
                    .buttonStyle(.plain)
                }
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)

                Button {
                    confirmingLogout = true
                } label: {
                    MenuRowLabel(
                        icon: "rectangle.portrait.and.arrow.right",
                        title: "Logout",
                        tint: .red
                    )
                }
                .buttonStyle(.plain)
                .disabled(isLoggingOut)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 20)
        }
        .background(Color.gray.opacity(0.08))
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

        if isLoggingOut {
            Color.black.opacity(0.35)
                .ignoresSafeArea()
                .transition(.opacity)
            VStack(spacing: 14) {
                ProgressView()
                    .controlSize(.large)
                    .tint(.white)
                Text("Signing out…")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)
            }
            .padding(28)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color.black.opacity(0.7))
            )
            .transition(.opacity)
        }
        }
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

private struct MenuRowLabel: View {
    let icon: String
    let title: String
    var tint: Color = .primary

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(tint == .primary ? Color.accentColor : tint)
                .frame(width: 24)
            Text(title)
                .font(.body)
                .foregroundStyle(tint)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.footnote)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .contentShape(Rectangle())
    }
}
