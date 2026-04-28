//
//  StoriesViewModel.swift
//  Luna Stories
//
//  Stale-while-revalidate cache for the story list, paginated.
//
//  Cache strategy: only the FIRST page is persisted (UserDefaults). On cold
//  start we hydrate that page synchronously so the list is non-empty
//  immediately, then `load()` refreshes from the network and rewrites the
//  cache. Subsequent pages from `loadMore()` are ephemeral — we don't try to
//  persist deep scroll state because the cursor would be stale on next launch
//  anyway.
//

import Foundation
import Observation

@Observable
@MainActor
final class StoriesViewModel {
    private(set) var stories: [StoryResponse] = []
    private(set) var isFetching: Bool = false
    private(set) var isLoadingMore: Bool = false
    private(set) var nextCursor: String? = nil
    var errorMessage: String?

    /// True only on cold start with no cache. Use to gate the shimmer.
    var isLoading: Bool { isFetching && stories.isEmpty }

    var canLoadMore: Bool { nextCursor != nil }

    init() {
        loadFromDisk()
    }

    func load() async {
        isFetching = true
        errorMessage = nil
        do {
            let page = try await StoryAPI.list()
            stories = page.items
            nextCursor = page.nextCursor
            saveToDisk()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isFetching = false
    }

    func loadMore() async {
        guard !isLoadingMore, !isFetching, let cursor = nextCursor else { return }
        isLoadingMore = true
        do {
            let page = try await StoryAPI.list(cursor: cursor)
            stories.append(contentsOf: page.items)
            nextCursor = page.nextCursor
            // Intentionally NOT saved to cache — cache is page-1 only.
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoadingMore = false
    }

    // MARK: - Cache (page 1 only)

    private let cacheKey = "cached_stories"

    private func loadFromDisk() {
        guard
            let data = UserDefaults.standard.data(forKey: cacheKey),
            let cached = try? JSONDecoder().decode([StoryResponse].self, from: data)
        else { return }
        stories = cached
        // nextCursor stays nil — cached cursor would be stale. The first
        // `load()` will populate it from the fresh response.
    }

    private func saveToDisk() {
        // Persist only what came back from the first-page fetch (i.e. the
        // current `stories` array right after `load()` — caller invariant).
        guard let data = try? JSONEncoder().encode(stories) else { return }
        UserDefaults.standard.set(data, forKey: cacheKey)
    }
}
