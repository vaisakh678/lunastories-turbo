//
//  Milo_TalesApp.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import ClerkKit
import SwiftUI

@main
struct Milo_TalesApp: App {
    @State private var avatars = AvatarsViewModel()
    @State private var generations = StoryGenerationManager()
    @State private var deepLinks = DeepLinkRouter()
    @State private var profile = ProfileViewModel()
    @State private var unread = LatestStoryViewModel()

    init() {
        Clerk.configure(publishableKey: "pk_test_YXJ0aXN0aWMtYm9hLTc4LmNsZXJrLmFjY291bnRzLmRldiQ")
        // Initialize OneSignal early so it can pick up cold-start launches
        // from a notification tap. Router + latestStory live at app scope
        // so the SDK's handlers (click + foreground) can write into them
        // from anywhere.
        PushNotifications.configure(router: deepLinks, latestStory: unread)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(Clerk.shared)
                .environment(avatars)
                .environment(generations)
                .environment(deepLinks)
                .environment(profile)
                .environment(unread)
                .preferredColorScheme(.dark)
                .task { await avatars.load() }
        }
    }
}

/// Holds the splash until BOTH conditions are met:
///   1. Clerk has finished restoring its environment + client (`isLoaded`),
///      so we never flash GetStartedView for a signed-in user.
///   2. A 1-second minimum hold elapses, so the splash doesn't blip away
///      on fast networks.
/// Whichever finishes last drives the swap.
private struct RootView: View {
    @Environment(Clerk.self) private var clerk
    @State private var minimumHoldDone = false

    private var canShowContent: Bool { clerk.isLoaded && minimumHoldDone }

    var body: some View {
        ZStack {
            if canShowContent {
                ContentView()
                    .transition(.opacity)
            } else {
                SplashView()
                    .transition(.opacity)
            }
        }
        .animation(.easeOut(duration: 0.25), value: canShowContent)
        .task {
            try? await Task.sleep(for: .seconds(1))
            minimumHoldDone = true
        }
    }
}
