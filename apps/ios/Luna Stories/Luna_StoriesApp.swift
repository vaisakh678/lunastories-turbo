//
//  Luna_StoriesApp.swift
//  Luna Stories
//
//  Created by vaisakh b on 25/04/26.
//

import ClerkKit
import SwiftUI

@main
struct Luna_StoriesApp: App {
    @State private var generations = StoryGenerationManager()
    @State private var deepLinks = DeepLinkRouter()
    @State private var profile = ProfileViewModel()
    @State private var unread = LatestStoryViewModel()
    @State private var subscriptions = SubscriptionsViewModel()
    @State private var toast = ToastCenter()

    init() {
        Clerk.configure(publishableKey: Config.clerkPublishableKey)
        // Initialize OneSignal early so it can pick up cold-start launches
        // from a notification tap. Router + latestStory live at app scope
        // so the SDK's handlers (click + foreground) can write into them
        // from anywhere.
        PushNotifications.configure(router: deepLinks, latestStory: unread)
        // RevenueCat — configure once at launch. Login follows in
        // ContentView.syncProfileAndPush once the backend user id is known.
        Subscriptions.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(Clerk.shared)
                .environment(generations)
                .environment(deepLinks)
                .environment(profile)
                .environment(unread)
                .environment(subscriptions)
                .environment(toast)
                .preferredColorScheme(.dark)
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
        // Toasts sit above everything at the app root, so they survive any
        // sheet being dismissed and always render at the very top.
        .overlay(alignment: .top) { ToastOverlay() }
        .task {
            try? await Task.sleep(for: .seconds(1))
            minimumHoldDone = true
        }
    }
}
