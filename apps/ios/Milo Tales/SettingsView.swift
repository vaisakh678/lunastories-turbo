//
//  SettingsView.swift
//  Milo Tales
//

import SwiftUI
import ClerkKit

struct SettingsView: View {
    @State private var sleepTimer: SleepTimer = .none
    @State private var voice: NarratorVoice = .shimmer
    @State private var speed: NarrationSpeed = .normal
    @State private var bedtimeRemindersEnabled: Bool = false
    @State private var bedtimeReminderTime: Date = defaultReminderTime()
    @State private var confirmingDelete: Bool = false
    @State private var isDeleting: Bool = false
    @State private var deleteErrorMessage: String?

    var body: some View {
        Form {
            Section("Audio & Playback") {
                Picker("Sleep timer", selection: $sleepTimer) {
                    ForEach(SleepTimer.allCases) { t in
                        Text(t.label).tag(t)
                    }
                }

                Picker("Narrator voice", selection: $voice) {
                    ForEach(NarratorVoice.allCases) { v in
                        Text(v.label).tag(v)
                    }
                }

                Picker("Narration speed", selection: $speed) {
                    ForEach(NarrationSpeed.allCases) { s in
                        Text(s.label).tag(s)
                    }
                }
                .pickerStyle(.segmented)
            }

            Section {
                Toggle("Daily bedtime reminder", isOn: $bedtimeRemindersEnabled)
                if bedtimeRemindersEnabled {
                    DatePicker(
                        "Remind me at",
                        selection: $bedtimeReminderTime,
                        displayedComponents: .hourAndMinute
                    )
                }
            } header: {
                Text("Notifications")
            } footer: {
                Text("We'll send a gentle nudge so you never miss story time.")
            }

            Section {
                NavigationLink {
                    LegalDocView(
                        title: "Terms of Service",
                        text: legalPlaceholder("Terms of Service")
                    )
                } label: {
                    SettingsRow(icon: "doc.text", title: "Terms of Service")
                }

                NavigationLink {
                    LegalDocView(
                        title: "Privacy Policy",
                        text: legalPlaceholder("Privacy Policy")
                    )
                } label: {
                    SettingsRow(icon: "hand.raised", title: "Privacy Policy")
                }

                HStack {
                    SettingsRow(icon: "info.circle", title: "Version")
                    Spacer()
                    Text(appVersion)
                        .font(.body)
                        .foregroundStyle(.secondary)
                }
            } header: {
                Text("About")
            }

            Section {
                Button(role: .destructive) {
                    confirmingDelete = true
                } label: {
                    HStack {
                        Image(systemName: "trash")
                        Text("Delete Account")
                    }
                }
                .disabled(isDeleting)
            } header: {
                Text("Danger zone")
            } footer: {
                Text("This permanently deletes your account, characters, and stories. This cannot be undone.")
            }
        }
        .scrollContentBackground(.hidden)
        .background(MoodyTwilightBackground().ignoresSafeArea())
        .navigationTitle("Settings")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .overlay {
            if isDeleting {
                DeletingOverlay()
            }
        }
        .alert(
            "Delete account?",
            isPresented: $confirmingDelete
        ) {
            Button("Cancel", role: .cancel) {}
            Button("Delete", role: .destructive) {
                Task { await handleDelete() }
            }
        } message: {
            Text("Your account, characters, and stories will be removed permanently.")
        }
        .alert(
            "Couldn't delete account",
            isPresented: Binding(
                get: { deleteErrorMessage != nil },
                set: { if !$0 { deleteErrorMessage = nil } }
            ),
            actions: { Button("OK") { deleteErrorMessage = nil } },
            message: { Text(deleteErrorMessage ?? "") }
        )
    }

    private func handleDelete() async {
        isDeleting = true
        do {
            _ = try await UserAPI.deleteAccount()
            try? await Clerk.shared.auth.signOut()
            // ContentView observes clerk.user; signing out swaps back to GetStartedView,
            // which unmounts this whole nav stack — no further state cleanup needed.
        } catch {
            deleteErrorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
            isDeleting = false
        }
    }
}

private struct DeletingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.35)
                .ignoresSafeArea()
            VStack(spacing: 14) {
                ProgressView()
                    .controlSize(.large)
                    .tint(.white)
                Text("Deleting account…")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white)
            }
            .padding(28)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color.black.opacity(0.7))
            )
        }
    }
}

// MARK: - Setting types

enum SleepTimer: Int, CaseIterable, Identifiable {
    case none = 0
    case tenMin = 10
    case twentyMin = 20
    case thirtyMin = 30

    var id: Int { rawValue }

    var label: String {
        switch self {
        case .none: "Off"
        case .tenMin: "10 min"
        case .twentyMin: "20 min"
        case .thirtyMin: "30 min"
        }
    }
}

enum NarratorVoice: String, CaseIterable, Identifiable {
    case shimmer
    case coral
    case fable
    case sage

    var id: String { rawValue }

    var label: String {
        switch self {
        case .shimmer: "Shimmer · soft"
        case .coral: "Coral · bright"
        case .fable: "Fable · storyteller"
        case .sage: "Sage · calm"
        }
    }
}

enum NarrationSpeed: String, CaseIterable, Identifiable {
    case slow
    case normal

    var id: String { rawValue }

    var label: String {
        switch self {
        case .slow: "Slower"
        case .normal: "Normal"
        }
    }
}

// MARK: - Helpers

private func defaultReminderTime() -> Date {
    var components = DateComponents()
    components.hour = 20
    components.minute = 0
    return Calendar.current.date(from: components) ?? Date()
}

private var appVersion: String {
    let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    return "\(v) (\(b))"
}

private func legalPlaceholder(_ title: String) -> String {
    """
    \(title)

    Placeholder. Replace with the real document before App Store submission.

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod \
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \
    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \
    commodo consequat.
    """
}

// MARK: - Row label

private struct SettingsRow: View {
    let icon: String
    let title: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(Color.accentColor)
                .frame(width: 24)
            Text(title)
                .foregroundStyle(.primary)
        }
    }
}

// MARK: - Legal doc viewer

private struct LegalDocView: View {
    let title: String
    let text: String

    var body: some View {
        ScrollView {
            Text(text)
                .font(.body)
                .lineSpacing(6)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
        }
        .navigationTitle(title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}
