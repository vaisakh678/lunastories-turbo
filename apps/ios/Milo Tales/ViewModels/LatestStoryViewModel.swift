//
//  LatestStoryViewModel.swift
//  Milo Tales
//
//  Stale-while-revalidate cache for the home banner's "latest actionable
//  story" (either generating or ready-but-unread).
//
//  - On init, hydrates `story` synchronously from UserDefaults so the
//    banner can render the moment HomeView appears on a cold launch.
//  - `refresh()` hits /api/v1/stories/latest-active, persists the fresh
//    response, and overwrites the cached value.
//  - We cache the *envelope* (a struct that wraps an optional story)
//    rather than the bare optional so "explicitly nothing" is also a
//    cacheable state — otherwise we'd flash a stale story between cold
//    launch and the first refresh.
//

import Foundation
import Observation

@Observable
@MainActor
final class LatestStoryViewModel {
    private(set) var story: StoryResponse?
    private(set) var isFetching: Bool = false
    /// Story ids the user has explicitly dismissed during this session.
    /// In-memory only — restarting the app re-shows the banner if the
    /// story is still active.
    private var dismissedIds: Set<String> = []

    init() {
        loadFromDisk()
    }

    func refresh() async {
        guard !isFetching else { return }
        isFetching = true
        defer { isFetching = false }
        do {
            let candidate = try await StoryAPI.latestActive()
            if let candidate, dismissedIds.contains(candidate.id) {
                story = nil
            } else {
                story = candidate
            }
            saveToDisk()
        } catch {
            // Quiet failure — keep whatever's cached so the user still
            // sees something useful when offline.
        }
    }

    /// Hide the banner for the rest of this session.
    func dismiss(_ id: String) {
        dismissedIds.insert(id)
        if story?.id == id {
            story = nil
            saveToDisk()
        }
    }

    /// Clear when the user opens the story (the next refresh will skip
    /// it server-side because lastReadAt is now set, but pre-clearing
    /// avoids a flash before that lands).
    func consume(_ id: String) {
        if story?.id == id {
            story = nil
            saveToDisk()
        }
    }

    // MARK: - Cache

    private let cacheKey = "cached_latest_active_story"

    private struct CachedEnvelope: Codable {
        let story: StoryResponse?
    }

    private func loadFromDisk() {
        guard
            let data = UserDefaults.standard.data(forKey: cacheKey),
            let cached = try? JSONDecoder().decode(CachedEnvelope.self, from: data)
        else { return }
        story = cached.story
    }

    private func saveToDisk() {
        let envelope = CachedEnvelope(story: story)
        guard let data = try? JSONEncoder().encode(envelope) else { return }
        UserDefaults.standard.set(data, forKey: cacheKey)
    }
}
