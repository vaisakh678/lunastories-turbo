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

            VStack(spacing: 22) {
                ZStack {
                    // Outer warm halo — coral lantern glow
                    Circle()
                        .fill(Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.35))
                        .frame(width: 280, height: 280)
                        .blur(radius: 60)

                    // Inner gold halo — closer warmth around the icon
                    Circle()
                        .fill(Color(red: 0.96, green: 0.73, blue: 0.26).opacity(0.30))
                        .frame(width: 200, height: 200)
                        .blur(radius: 40)

                    Image("SplashIcon")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 168, height: 168)
                        .clipShape(RoundedRectangle(cornerRadius: 38, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 38, style: .continuous)
                                .strokeBorder(Color.miloCream.opacity(0.12), lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.45), radius: 30, x: 0, y: 14)
                }

                VStack(spacing: 6) {
                    Text("Milo Tales")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundStyle(Color.miloCream)
                    Text("Bedtime, magical.")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.miloCream.opacity(0.55))
                        .tracking(0.4)
                }
            }
        }
    }
}
