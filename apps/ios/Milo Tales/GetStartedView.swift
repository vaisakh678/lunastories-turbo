//
//  GetStartedView.swift
//  Milo Tales
//

import ClerkKit
import SwiftUI

struct GetStartedView: View {
    @Bindable var auth: AuthFlowModel

    var body: some View {
        NavigationStack {
            ZStack {
                MoodyTwilightBackground()
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    Image("onboarding_0")
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 220, height: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 40, style: .continuous))

                    VStack(spacing: 12) {
                        Text("Welcome to Milo Tales")
                            .font(.system(size: 34, weight: .bold))
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.center)
                        Text("Your story begins here.\nLet's explore together.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                    }
                    .padding(.top, 32)

                    Spacer()

                    VStack(spacing: 12) {
                        Button {
                            auth.providerMode = .signUp
                            auth.showOnboarding = true
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
                            auth.openProviders(mode: .signIn)
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
            .navigationDestination(isPresented: $auth.showOnboarding) {
                OnboardingCarouselView {
                    auth.sheetStep = .providers
                }
            }
        }
    }
}
