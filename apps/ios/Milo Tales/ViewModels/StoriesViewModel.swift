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
    var errorMessage: String?

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            stories = try await StoryAPI.list()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }
}
