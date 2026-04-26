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
