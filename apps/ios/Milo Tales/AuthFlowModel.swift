//
//  AuthFlowModel.swift
//  Milo Tales
//
//  Owns the entire pre-auth flow (sheet step, email/otp state, in-flight Clerk
//  resources). Mounted at ContentView level so the sheet's host doesn't get torn
//  down when ContentView swaps GetStartedView -> HomeView on successful auth.
//
//  Auth handlers complete `setActive` BEFORE dismissing the sheet. ContentView
//  gates the swap to HomeView on a separate bool that flips inside `onDismiss`,
//  so the home swap only happens after the dismiss animation has fully completed
//  (Post-Dismiss Navigation Gate Pattern).
//

import ClerkKit
import Observation
import SwiftUI

@Observable @MainActor
final class AuthFlowModel {
    var sheetStep: SignInSheet?
    var providerMode: ProviderSheet.Mode = .signIn
    var email: String = ""
    var isLoading: Bool = false
    /// Which provider button is currently in flight on the providers sheet
    /// (so the button can swap its icon for a spinner).
    var loadingProvider: ProviderSheet.LoadingProvider?
    var errorMessage: String?
    var showOnboarding: Bool = false

    private var pendingStep: SignInSheet?
    private var inProgressSignIn: SignIn?
    private var inProgressSignUp: SignUp?

    // MARK: - Public flow control

    func openProviders(mode: ProviderSheet.Mode) {
        providerMode = mode
        sheetStep = .providers
    }

    func transition(to next: SignInSheet) {
        pendingStep = next
        sheetStep = nil
    }

    /// Sheet's `onDismiss`. Only handles the multi-step transition case
    /// (`transition(to:)` queues the next step, `sheetStep = nil` triggers
    /// dismiss, this reopens with the queued step). User-initiated dismiss
    /// stays where the user was — onboarding push is preserved.
    /// (Successful-auth gating is handled by ContentView, not the model.)
    func handleSheetDismiss() {
        if let next = pendingStep {
            pendingStep = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                self.sheetStep = next
            }
        }
    }

    // MARK: - Clerk handlers — `setActive` runs FIRST, then the sheet dismisses.
    // ContentView's `onDismiss` flips its `canNavigateToHome` gate so the
    // GetStartedView -> HomeView swap happens after the sheet animation ends.

    func handleEmailContinue() async {
        let trimmed = email.trimmingCharacters(in: .whitespaces).lowercased()
        guard !trimmed.isEmpty else { return }
        isLoading = true
        defer { isLoading = false }

        // Try sign-in first; if user not found, fall back to sign-up.
        do {
            var signIn = try await Clerk.shared.auth.signIn(trimmed)
            signIn = try await signIn.sendEmailCode()
            inProgressSignIn = signIn
            inProgressSignUp = nil
            transition(to: .otp)
        } catch {
            do {
                var signUp = try await Clerk.shared.auth.signUp(emailAddress: trimmed)
                signUp = try await signUp.sendEmailCode()
                inProgressSignUp = signUp
                inProgressSignIn = nil
                transition(to: .otp)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    func handleVerify(code: String) async {
        guard code.count == 6 else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            var sessionId: String?
            if let signIn = inProgressSignIn {
                let updated = try await signIn.verifyCode(code)
                inProgressSignIn = updated
                if updated.status == .complete {
                    sessionId = updated.createdSessionId
                }
            } else if let signUp = inProgressSignUp {
                let updated = try await signUp.verifyEmailCode(code)
                inProgressSignUp = updated
                if updated.status == .complete {
                    sessionId = updated.createdSessionId
                }
            }
            if let sessionId {
                await activateThenDismiss(sessionId: sessionId)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func handleApple() async {
        isLoading = true
        loadingProvider = .apple
        defer {
            isLoading = false
            loadingProvider = nil
        }
        do {
            let result = try await Clerk.shared.auth.signInWithApple()
            if let id = sessionId(from: result) {
                await activateThenDismiss(sessionId: id)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func handleGoogle() async {
        isLoading = true
        loadingProvider = .google
        defer {
            isLoading = false
            loadingProvider = nil
        }
        do {
            let result = try await Clerk.shared.auth.signInWithOAuth(provider: .google)
            if let id = sessionId(from: result) {
                await activateThenDismiss(sessionId: id)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Internals

    /// Activate the session first (Clerk.user flips), then close the sheet.
    /// The HomeView swap is gated by ContentView's `canNavigateToHome` so it
    /// won't run until `onDismiss` fires.
    private func activateThenDismiss(sessionId: String) async {
        do {
            try await Clerk.shared.auth.setActive(sessionId: sessionId)
        } catch {
            errorMessage = error.localizedDescription
            return
        }
        pendingStep = nil
        sheetStep = nil
    }

    private func sessionId(from result: TransferFlowResult) -> String? {
        switch result {
        case .signIn(let signIn): return signIn.createdSessionId
        case .signUp(let signUp): return signUp.createdSessionId
        }
    }
}
