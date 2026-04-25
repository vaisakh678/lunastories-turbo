//
//  CharactersViewModel.swift
//  Milo Tales
//

import Foundation
import Observation

@Observable
@MainActor
final class CharactersViewModel {
    private(set) var characters: [Character] = []
    private(set) var isLoading: Bool = false
    var errorMessage: String?

    var mainCharacters: [Character] { characters.filter { $0.role == .main } }
    var sideCharacters: [Character] { characters.filter { $0.role == .side } }

    func load() async {
        isLoading = true
        errorMessage = nil
        do {
            characters = try await CharacterAPI.list()
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }

    func add(_ request: CreateCharacterRequest) async {
        errorMessage = nil
        do {
            let created = try await CharacterAPI.create(request)
            characters.insert(created, at: 0)
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }
}
