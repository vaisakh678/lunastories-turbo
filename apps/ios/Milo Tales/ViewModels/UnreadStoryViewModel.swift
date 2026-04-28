//
//  UnreadStoryViewModel.swift
//  Milo Tales
//
//  Holds the most recent unread-but-ready story (if any) so HomeView can
//  render a "Pick up where you left off" banner above the character grid.
//  Backed by GET /api/v1/stories/latest-unread which already filters to
//  the last 48 hours, so the banner naturally fades out for stories the
//  user intentionally skipped.
//
//  Lives at app scope (injected via .environment) so any screen that
//  affects read state (the reader stamping lastReadAt, the user manually
//  dismissing) can poke `refresh()` without prop-drilling.
//

import Foundation
import Observation

@Observable
@MainActor
final class UnreadStoryViewModel {
    private(set) var story: StoryResponse?
    private(set) var isLoading: Bool = false
    /// Story ids the user has explicitly dismissed during this session.
    /// In-memory only — restarting the app re-shows the banner if the
    /// story is still unread (intentional; this is a "did you forget?"
    /// nudge, not a permanent state).
    private var dismissedIds: Set<String> = []

    func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let candidate = try await StoryAPI.latestUnread()
            print("🔖 latestUnread fetch → \(candidate.map { "\($0.id) — \($0.title ?? "<no title>")" } ?? "nil")")
            if let candidate, dismissedIds.contains(candidate.id) {
                story = nil
            } else {
                story = candidate
            }
        } catch {
            print("🔖 latestUnread error: \(error)")
            story = nil
        }
    }

    /// Hide for the rest of this session.
    func dismiss(_ id: String) {
        dismissedIds.insert(id)
        if story?.id == id { story = nil }
    }

    /// Clear after the user actually opens the story (the next refresh
    /// would skip it server-side because lastReadAt is now set, but
    /// dropping it locally avoids a flash before that lands).
    func consume(_ id: String) {
        if story?.id == id { story = nil }
    }
}
