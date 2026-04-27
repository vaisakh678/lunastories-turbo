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
            MoodyTwilightBackground()
                .ignoresSafeArea()

            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(Color.miloCream.opacity(0.10))
                        .frame(width: 220, height: 220)
                    Image(systemName: "moon.stars.fill")
                        .font(.system(size: 100, weight: .semibold))
                        .foregroundStyle(Color.miloCream)
                    Image(systemName: "sparkles")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(Color(red: 0.96, green: 0.73, blue: 0.26))
                        .offset(x: 90, y: -70)
                    Image(systemName: "sparkle")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(Color(red: 0.91, green: 0.45, blue: 0.30))
                        .offset(x: -85, y: 60)
                }

                Text("Milo Tales")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(Color.miloCream)
            }
        }
    }
}
