//
//  SignInModal.swift
//  Milo Tales
//

import SwiftUI

// Re-themed for the moody twilight palette. The names still read as their
// original light-mode roles so the rest of the file doesn't have to change.
private let cream = Color(red: 1.0, green: 0.97, blue: 0.93)
private let primaryBlue = Color.accentColor          // coral, via AccentColor asset
private let textDark = cream                         // headings + button text on dark glass
private let textMedium = cream.opacity(0.7)          // body / subtitle
private let textLight = cream.opacity(0.45)          // placeholders / footer hints
private let borderGray = cream.opacity(0.15)         // dividers + input borders
private let inputBg = cream.opacity(0.08)            // input field fill
private let lightButtonBg = cream.opacity(0.10)      // Google + Email pill background
private let otpIconBg = Color.accentColor.opacity(0.18) // OTP envelope circle fill

enum SignInSheet: Identifiable {
    case providers
    case email
    case otp

    var id: String {
        switch self {
        case .providers: "providers"
        case .email: "email"
        case .otp: "otp"
        }
    }
}

struct ProviderSheet: View {
    enum Mode {
        case signIn
        case signUp

        var title: String {
            switch self {
            case .signIn: "Welcome Back"
            case .signUp: "Get Started"
            }
        }

        var subtitle: String {
            switch self {
            case .signIn: "Sign in to access your stories\nand keep the magic going."
            case .signUp: "Continue to sign up and start\nbuilding your bedtime stories."
            }
        }
    }

    enum LoadingProvider {
        case apple
        case google
    }

    var mode: Mode = .signIn
    let isLoading: Bool
    var loadingProvider: LoadingProvider? = nil
    let onApple: () -> Void
    let onGoogle: () -> Void
    let onEmail: () -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(textDark)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Close")
                Spacer()
            }
            .padding(.bottom, 16)

            VStack(spacing: 8) {
                Text(mode.title)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(textDark)
                Text(mode.subtitle)
                    .font(.system(size: 15))
                    .foregroundStyle(textMedium)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(.bottom, 28)

            #if os(iOS)
            providerButton(
                action: onApple,
                background: Color.black,
                foreground: .white,
                icon: AnyView(
                    Image(systemName: "applelogo")
                        .font(.system(size: 18))
                        .foregroundStyle(.white)
                ),
                label: "Continue with Apple",
                showsSpinner: loadingProvider == .apple,
                spinnerTint: .white,
                isDisabled: loadingProvider != nil
            )
            .padding(.bottom, 12)
            #endif

            providerButton(
                action: onGoogle,
                background: lightButtonBg,
                foreground: textDark,
                icon: AnyView(googleLogo),
                label: "Continue with Google",
                showsSpinner: loadingProvider == .google,
                spinnerTint: textDark,
                isDisabled: loadingProvider != nil
            )

            HStack(spacing: 14) {
                Rectangle().fill(borderGray).frame(height: 1)
                Text("or")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(textLight)
                Rectangle().fill(borderGray).frame(height: 1)
            }
            .padding(.vertical, 18)

            providerButton(
                action: onEmail,
                background: lightButtonBg,
                foreground: textDark,
                icon: AnyView(
                    Image(systemName: "envelope.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(textDark)
                ),
                label: "Continue with Email",
                isDisabled: loadingProvider != nil
            )

            Spacer(minLength: 24)

            Text("By continuing you agree to Milo Tales's \(Text("Terms & Conditions").foregroundStyle(primaryBlue)) and \(Text("Privacy Policy").foregroundStyle(primaryBlue))")
                .foregroundStyle(textMedium)
                .font(.system(size: 13))
                .multilineTextAlignment(.center)
            .padding(.horizontal, 8)
            .padding(.bottom, 8)
        }
        .padding(.horizontal, 24)
        .padding(.top, 28)
        .padding(.bottom, 24)
    }

    private func providerButton(
        action: @escaping () -> Void,
        background: Color,
        foreground: Color,
        icon: AnyView,
        label: String,
        showsSpinner: Bool = false,
        spinnerTint: Color = .secondary,
        isDisabled: Bool = false
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if showsSpinner {
                    ProgressView()
                        .tint(spinnerTint)
                        .frame(width: 20, height: 20)
                } else {
                    icon
                }
                Text(label)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(foreground)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Capsule().fill(background))
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
    }

    private var googleLogo: some View {
        Image("GoogleLogo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(width: 20, height: 20)
    }
}

struct EmailSheet: View {
    @Binding var email: String
    let isLoading: Bool
    let onContinue: () -> Void

    @Environment(\.dismiss) private var dismiss

    private var canContinue: Bool {
        let trimmed = email.trimmingCharacters(in: .whitespaces)
        return !isLoading && trimmed.contains("@") && trimmed.contains(".")
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(textDark)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Close")
                Spacer()
            }
            .padding(.bottom, 16)

            VStack(spacing: 8) {
                Text("Enter your email")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(textDark)
                Text("We'll send you a 6-digit code to sign in.")
                    .font(.system(size: 15))
                    .foregroundStyle(textMedium)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(.bottom, 24)

            HStack(spacing: 10) {
                Image(systemName: "envelope")
                    .font(.system(size: 20))
                    .foregroundStyle(textLight)
                TextField("Email address", text: $email)
                    .font(.system(size: 16))
                    .foregroundStyle(textDark)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                    .submitLabel(.next)
                    .onSubmit { if canContinue { onContinue() } }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 15)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous).fill(inputBg)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(borderGray, lineWidth: 1.5)
            )
            .padding(.bottom, 14)

            Button(action: onContinue) {
                ZStack {
                    Text("Continue")
                        .opacity(isLoading ? 0 : 1)
                    if isLoading {
                        ProgressView().tint(.white)
                    }
                }
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().fill(primaryBlue))
                .opacity(canContinue || isLoading ? 1 : 0.7)
            }
            .buttonStyle(.plain)
            .disabled(!canContinue)
            .shadow(color: primaryBlue.opacity(0.2), radius: 8, x: 0, y: 4)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 24)
    }
}

struct OtpSheet: View {
    let email: String
    let isLoading: Bool
    let onVerify: (String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var code: String = ""
    @State private var showResendConfirm: Bool = false

    private var canVerify: Bool { !isLoading && code.count == 6 }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(textDark)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Close")
                Spacer()
            }
            .padding(.bottom, 16)

            VStack(spacing: 0) {
                Circle()
                    .fill(otpIconBg)
                    .frame(width: 56, height: 56)
                    .overlay(
                        Image(systemName: "envelope")
                            .font(.system(size: 26))
                            .foregroundStyle(primaryBlue)
                    )
                    .padding(.bottom, 16)

                Text("Check your email")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(textDark)
                    .padding(.bottom, 8)

                Text("We sent a 6-digit code to \(Text(email).foregroundStyle(textDark).fontWeight(.semibold))")
                    .foregroundStyle(textMedium)
                    .font(.system(size: 15))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(.bottom, 24)

            HStack(spacing: 10) {
                Image(systemName: "circle.grid.3x3")
                    .font(.system(size: 20))
                    .foregroundStyle(textLight)
                TextField("Enter 6-digit code", text: $code)
                    .font(.system(size: 16))
                    .foregroundStyle(textDark)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .submitLabel(.done)
                    .onSubmit { if canVerify { onVerify(code) } }
                    .onChange(of: code) { _, newValue in
                        let filtered = String(newValue.filter { $0.isNumber }.prefix(6))
                        if filtered != newValue { code = filtered }
                    }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 15)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous).fill(inputBg)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(borderGray, lineWidth: 1.5)
            )
            .padding(.bottom, 14)

            Button {
                onVerify(code)
            } label: {
                ZStack {
                    Text("Verify")
                        .opacity(isLoading ? 0 : 1)
                    if isLoading {
                        ProgressView().tint(.white)
                    }
                }
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Capsule().fill(primaryBlue))
                .opacity(canVerify || isLoading ? 1 : 0.7)
            }
            .buttonStyle(.plain)
            .disabled(!canVerify)
            .shadow(color: primaryBlue.opacity(0.2), radius: 8, x: 0, y: 4)

            Button {
                showResendConfirm = true
            } label: {
                Text("Didn’t receive a code? \(Text("Resend").foregroundStyle(primaryBlue).fontWeight(.semibold))")
                    .foregroundStyle(textMedium)
                    .font(.system(size: 14))
            }
            .buttonStyle(.plain)
            .padding(.top, 14)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 24)
        .alert("Code sent", isPresented: $showResendConfirm) {
            Button("OK") {}
        } message: {
            Text("A new code has been sent to your email.")
        }
    }
}
