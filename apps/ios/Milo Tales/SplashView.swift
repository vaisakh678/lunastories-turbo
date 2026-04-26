//
//  SplashView.swift
//  Milo Tales
//
//  Shown while Clerk is restoring its session/environment on cold launch
//  (`Clerk.shared.isLoaded == false`). Holds the same gradient + logo as
//  GetStartedView so transitioning between them is seamless.
//

import SwiftUI

struct SplashView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.purple.opacity(0.15), Color.blue.opacity(0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 20) {
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

                Text("Milo Tales")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(.primary)
            }
        }
    }
}
