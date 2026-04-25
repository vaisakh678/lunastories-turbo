//
//  GetStartedView.swift
//  Milo Tales
//

import SwiftUI

struct GetStartedView: View {
    let onContinue: () -> Void

    @State private var sheetStep: SignInSheet?
    @State private var pendingStep: SignInSheet?
    @State private var email: String = ""

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
                    Button(action: onContinue) {
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
    }

    private func detents(for step: SignInSheet) -> Set<PresentationDetent> {
        switch step {
        case .providers: return [.medium]
        case .email, .otp: return [.large]
        }
    }

    @ViewBuilder
    private func sheetContent(for step: SignInSheet) -> some View {
        switch step {
        case .providers:
            ProviderSheet(
                onApple: completeAuth,
                onGoogle: completeAuth,
                onEmail: { transition(to: .email) }
            )
        case .email:
            EmailSheet(
                email: $email,
                onContinue: { transition(to: .otp) }
            )
        case .otp:
            OtpSheet(
                email: email,
                onVerified: completeAuth
            )
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

    private func completeAuth() {
        pendingStep = nil
        sheetStep = nil
        onContinue()
    }
}
