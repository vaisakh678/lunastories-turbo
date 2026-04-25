//
//  GetStartedView.swift
//  Milo Tales
//

import SwiftUI
import ClerkKit

struct GetStartedView: View {
    @State private var sheetStep: SignInSheet?
    @State private var pendingStep: SignInSheet?
    @State private var email: String = ""
    @State private var inProgressSignIn: SignIn?
    @State private var inProgressSignUp: SignUp?
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.purple.opacity(0.15), Color.blue.opacity(0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                ZStack {
                    Circle()
                        .fill(Color.purple.opacity(0.18))
                        .frame(width: 220, height: 220)
                    Image(systemName: "moon.stars.fill")
                        .font(.system(size: 100, weight: .semibold))
                        .foregroundStyle(.purple)
                    Image(systemName: "sparkles")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(.yellow)
                        .offset(x: 90, y: -70)
                    Image(systemName: "sparkle")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.orange)
                        .offset(x: -85, y: 60)
                }

                VStack(spacing: 12) {
                    Text("Milo Tales")
                        .font(.system(size: 40, weight: .bold))
                        .foregroundStyle(.primary)
                    Text("Magical bedtime stories,\nmade just for your little one.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                }
                .padding(.top, 32)

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        sheetStep = .providers
                    } label: {
                        Text("Get Started")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Capsule().fill(Color.accentColor))
                    }
                    .buttonStyle(.plain)

                    Button {
                        sheetStep = .providers
                    } label: {
                        HStack(spacing: 4) {
                            Text("Already have an account?")
                                .foregroundStyle(.secondary)
                            Text("Sign in")
                                .foregroundStyle(.tint)
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 28)
            }
        }
        .sheet(item: $sheetStep, onDismiss: openPendingIfAny) { step in
            sheetContent(for: step)
                .presentationDetents(detents(for: step))
                .presentationDragIndicator(.visible)
        }
        .alert(
            "Sign in failed",
            isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            ),
            actions: { Button("OK") { errorMessage = nil } },
            message: { Text(errorMessage ?? "") }
        )
    }

    @ViewBuilder
    private func sheetContent(for step: SignInSheet) -> some View {
        switch step {
        case .providers:
            ProviderSheet(
                isLoading: isLoading,
                onApple: { Task { await handleApple() } },
                onGoogle: { Task { await handleGoogle() } },
                onEmail: { transition(to: .email) }
            )
        case .email:
            EmailSheet(
                email: $email,
                isLoading: isLoading,
                onContinue: { Task { await handleEmailContinue() } }
            )
        case .otp:
            OtpSheet(
                email: email,
                isLoading: isLoading,
                onVerify: { code in Task { await handleVerify(code: code) } }
            )
        }
    }

    private func detents(for step: SignInSheet) -> Set<PresentationDetent> {
        switch step {
        case .providers: return [.medium]
        case .email, .otp: return [.large]
        }
    }

    private func transition(to next: SignInSheet) {
        pendingStep = next
        sheetStep = nil
    }

    private func openPendingIfAny() {
        guard let next = pendingStep else { return }
        pendingStep = nil
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            sheetStep = next
        }
    }

    // MARK: - Clerk auth handlers

    private func handleEmailContinue() async {
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
            return
        } catch {
            // Try sign-up.
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

    private func handleVerify(code: String) async {
        guard code.count == 6 else { return }
        isLoading = true
        defer { isLoading = false }

        do {
            if let signIn = inProgressSignIn {
                let updated = try await signIn.verifyCode(code)
                inProgressSignIn = updated
                if updated.status == .complete, let sessionId = updated.createdSessionId {
                    try await Clerk.shared.auth.setActive(sessionId: sessionId)
                }
            } else if let signUp = inProgressSignUp {
                let updated = try await signUp.verifyEmailCode(code)
                inProgressSignUp = updated
                if updated.status == .complete, let sessionId = updated.createdSessionId {
                    try await Clerk.shared.auth.setActive(sessionId: sessionId)
                }
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func handleApple() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let result = try await Clerk.shared.auth.signInWithApple()
            try await activateSession(from: result)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func handleGoogle() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let result = try await Clerk.shared.auth.signInWithOAuth(provider: .google)
            try await activateSession(from: result)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func activateSession(from result: TransferFlowResult) async throws {
        switch result {
        case .signIn(let signIn):
            if let sessionId = signIn.createdSessionId {
                try await Clerk.shared.auth.setActive(sessionId: sessionId)
            }
        case .signUp(let signUp):
            if let sessionId = signUp.createdSessionId {
                try await Clerk.shared.auth.setActive(sessionId: sessionId)
            }
        }
    }
}
