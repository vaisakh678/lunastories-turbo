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
        .task { canNavigateToHome = clerk.user != nil }
        // On logout, close the gate so the next login follows the dismiss flow.
        .onChange(of: clerk.user != nil) { _, isSignedIn in
            if !isSignedIn { canNavigateToHome = false }
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
