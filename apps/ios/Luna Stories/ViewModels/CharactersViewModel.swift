//
//  CharactersViewModel.swift
//  Luna Stories
//
//  Stale-while-revalidate cache for the user's characters.
//  - On init, hydrates `characters` synchronously from a Documents/characters.json cache.
//  - `load()` flips `isFetching` true while the network call runs, and writes
//    the fresh response back to disk on success.
//  - `isLoading` is derived: true only when we're fetching AND have nothing
//    to show (cold start). Subsequent refreshes are silent (SWR-style).
//  Mutations (add/update/delete) also persist immediately so the cache stays
//  in sync — no need to refetch after each.
//

import Foundation
import Observation

@Observable
@MainActor
final class CharactersViewModel {
    private(set) var characters: [Character] = []
    /// True while the network call is in flight.
    private(set) var isFetching: Bool = false
    var errorMessage: String?

    /// True when we're fetching AND have no data to display yet (memory + cache both empty).
    /// Use this to drive cold-start placeholders/shimmers; `isFetching` alone is for
    /// silent background refresh affordances (e.g. pull-to-refresh).
    var isLoading: Bool { isFetching && characters.isEmpty }

    var mainCharacters: [Character] { characters.filter { $0.role == .main } }
    var sideCharacters: [Character] { characters.filter { $0.role == .side } }

    init() {
        loadFromDisk()
    }

    // MARK: - Network

    func load() async {
        isFetching = true
        errorMessage = nil
        do {
            characters = try await CharacterAPI.list()
            saveToDisk()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isFetching = false
    }

    func add(_ request: CreateCharacterRequest) async {
        errorMessage = nil
        do {
            let created = try await CharacterAPI.create(request)
            characters.insert(created, at: 0)
            saveToDisk()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }

    func update(_ id: UUID, _ patch: UpdateCharacterRequest) async {
        errorMessage = nil
        do {
            let updated = try await CharacterAPI.update(id, patch)
            if let idx = characters.firstIndex(where: { $0.id == id }) {
                characters[idx] = updated
            }
            saveToDisk()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }

    func delete(_ id: UUID) async -> Bool {
        errorMessage = nil
        do {
            try await CharacterAPI.delete(id)
            characters.removeAll { $0.id == id }
            saveToDisk()
            return true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
            return false
        }
    }

    // MARK: - Cache

    private let cacheKey = "cached_characters"

    private func loadFromDisk() {
        guard
            let data = UserDefaults.standard.data(forKey: cacheKey),
            let cached = try? JSONDecoder().decode([Character].self, from: data)
        else { return }
        characters = cached
    }

    private func saveToDisk() {
        guard let data = try? JSONEncoder().encode(characters) else { return }
        UserDefaults.standard.set(data, forKey: cacheKey)
    }
}
