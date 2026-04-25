//
//  StoriesViewModel.swift
//  Milo Tales
//

import Foundation
import Observation

@Observable
@MainActor
final class StoriesViewModel {
    private(set) var stories: [StoryResponse] = []
    private(set) var isLoading: Bool = false
    private(set) var isLoadingMore: Bool = false
    private(set) var nextCursor: String? = nil
    var errorMessage: String?

    var canLoadMore: Bool { nextCursor != nil }

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            let page = try await StoryAPI.list()
            stories = page.items
            nextCursor = page.nextCursor
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }

    func loadMore() async {
        guard !isLoadingMore, !isLoading, let cursor = nextCursor else { return }
        isLoadingMore = true
        do {
            let page = try await StoryAPI.list(cursor: cursor)
            stories.append(contentsOf: page.items)
            nextCursor = page.nextCursor
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoadingMore = false
    }
}
