//
//  ContentView.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import ClerkKit
import SwiftUI

struct ContentView: View {
    @Environment(Clerk.self) private var clerk
    @Environment(ProfileViewModel.self) private var profile
    @State private var auth = AuthFlowModel()

    /// Post-Dismiss Navigation Gate. Controls when the GetStartedView -> HomeView
    /// swap is allowed to run. Only flips inside the sheet's `onDismiss`, so the
    /// swap happens after the modal's dismiss animation has fully completed.
    @State private var canNavigateToHome = false

    var body: some View {
        @Bindable var auth = auth
        Group {
            if clerk.user != nil && canNavigateToHome {
                HomeView()
            } else {
                GetStartedView(auth: auth)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: clerk.user != nil && canNavigateToHome)
        // Sheet hosted here (not on GetStartedView) so swapping to HomeView on
        // successful auth doesn't yank the sheet's host out from under the
        // dismiss animation.
        .sheet(item: $auth.sheetStep, onDismiss: {
            auth.handleSheetDismiss()
            // Open the gate only after the sheet has fully finished dismissing.
            if clerk.user != nil {
                canNavigateToHome = true
            }
        }) { step in
            sheetContent(for: step)
                .presentationDetents(detents(for: step))
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
        }
        .alert(
            "Sign in failed",
            isPresented: Binding(
                get: { auth.errorMessage != nil },
                set: { if !$0 { auth.errorMessage = nil } }
            ),
            actions: { Button("OK") { auth.errorMessage = nil } },
            message: { Text(auth.errorMessage ?? "") }
        )
        // Cold launch with restored session: skip the gate, go straight to Home.
        .task {
            canNavigateToHome = clerk.user != nil
            if clerk.user != nil {
                await syncProfileAndPush()
            }
        }
        // On logout, close the gate so the next login follows the dismiss flow.
        .onChange(of: clerk.user != nil) { _, isSignedIn in
            if !isSignedIn {
                canNavigateToHome = false
                profile.clear()
                PushNotifications.logout()
            } else {
                Task { await syncProfileAndPush() }
            }
        }
    }

    /// Fetch the backend profile so we know the *internal* user id, then
    /// hand that to OneSignal as the external_user_id. Falls back to a
    /// silent no-op if the profile fetch fails (e.g. backend offline) —
    /// the next sign-in / launch will retry.
    ///
    /// Also kicks the permission prompt right after login. The user has
    /// just signed in, so they're committed to using the app — that's a
    /// natural moment to ask. Without this, the OS-level subscription
    /// never completes and OneSignal returns "All included players are
    /// not subscribed" when the backend tries to send a push.
    private func syncProfileAndPush() async {
        await profile.load()
        if let userId = profile.profile?.id {
            PushNotifications.login(userId: userId)
            PushNotifications.requestPermissionIfNeeded()
        }
    }

    @ViewBuilder
    private func sheetContent(for step: SignInSheet) -> some View {
        switch step {
        case .providers:
            ProviderSheet(
                mode: auth.providerMode,
                isLoading: auth.isLoading,
                loadingProvider: auth.loadingProvider,
                onApple: { Task { await auth.handleApple() } },
                onGoogle: { Task { await auth.handleGoogle() } },
                onEmail: { auth.transition(to: .email) }
            )
        case .email:
            EmailSheet(
                email: $auth.email,
                isLoading: auth.isLoading,
                onContinue: { Task { await auth.handleEmailContinue() } }
            )
        case .otp:
            OtpSheet(
                email: auth.email,
                isLoading: auth.isLoading,
                onVerify: { code in Task { await auth.handleVerify(code: code) } }
            )
        }
    }

    private func detents(for step: SignInSheet) -> Set<PresentationDetent> {
        switch step {
        case .providers: return [.medium]
        case .email, .otp: return [.large]
        }
    }
}
