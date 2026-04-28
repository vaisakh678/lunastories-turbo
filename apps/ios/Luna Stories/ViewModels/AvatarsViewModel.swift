//
//  AvatarsViewModel.swift
//  Luna Stories
//
//  Stale-while-revalidate cache for the seeded avatar list (id, file ref, url).
//  - On init, hydrates `avatars` synchronously from Documents/avatars.json so
//    CharacterIconView can resolve avatar IDs immediately on cold launch
//    (Kingfisher then loads the image from its own disk cache).
//  - `load()` flips `isFetching` true while the network call runs, persists
//    the fresh response back to disk, and flips `isFetching` off.
//  - `isLoading` is derived: true only on cold start with no cache.
//

import Foundation
import Observation

@Observable
@MainActor
final class AvatarsViewModel {
    private(set) var avatars: [AvatarResponse] = []
    private(set) var isFetching: Bool = false
    var errorMessage: String?

    var isLoading: Bool { isFetching && avatars.isEmpty }

    init() {
        loadFromDisk()
    }

    func load() async {
        isFetching = true
        errorMessage = nil
        do {
            avatars = try await AvatarAPI.list()
            saveToDisk()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isFetching = false
    }

    func avatar(byId id: String) -> AvatarResponse? {
        avatars.first { $0.id == id }
    }

    // MARK: - Cache

    private let cacheKey = "cached_avatars"

    private func loadFromDisk() {
        guard
            let data = UserDefaults.standard.data(forKey: cacheKey),
            let cached = try? JSONDecoder().decode([AvatarResponse].self, from: data)
        else { return }
        avatars = cached
    }

    private func saveToDisk() {
        guard let data = try? JSONEncoder().encode(avatars) else { return }
        UserDefaults.standard.set(data, forKey: cacheKey)
    }
}
