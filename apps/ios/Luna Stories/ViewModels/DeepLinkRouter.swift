//
//  DeepLinkRouter.swift
//  Luna Stories
//
//  Lightweight inbox for deep links arriving from outside the SwiftUI tree
//  (push notifications today; universal links / share sheet later). The
//  OneSignal click handler writes a pending story id here, HomeView
//  observes it, pushes the reader, and clears it.
//

import Foundation
import Observation

@Observable
@MainActor
final class DeepLinkRouter {
    /// Story id pending presentation. HomeView clears this once it has
    /// pushed the reader so subsequent identical pushes still register.
    var pendingStoryId: String?

    func openStory(id: String) {
        pendingStoryId = id
    }
}
