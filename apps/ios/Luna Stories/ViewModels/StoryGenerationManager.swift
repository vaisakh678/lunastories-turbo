//
//  StoryGenerationManager.swift
//  Luna Stories
//
//  Holds in-flight story generations so they survive past the mode sheet
//  being dismissed. When the user dismisses the generating modal early,
//  the API call keeps running here, the home screen shows a progress
//  banner, and once the story is ready the user can tap the banner to
//  jump straight into the reader.
//

import Foundation
import Observation

/// Status of one in-flight generation. Drives the banner appearance and
/// the modal's "should I push the reader?" decision.
enum GenerationStatus {
    case generating
    case ready(StoryResponse)
    case failed(String)

    var isReady: Bool {
        if case .ready = self { return true }
        return false
    }

    var readyStory: StoryResponse? {
        if case .ready(let story) = self { return story }
        return nil
    }

    /// Equatable-by-kind only — story payloads aren't Equatable, but for
    /// observation purposes we only care whether the status *changed*.
    var kind: Int {
        switch self {
        case .generating: return 0
        case .ready: return 1
        case .failed: return 2
        }
    }
}

struct InFlightGeneration: Identifiable {
    let id: UUID
    let title: String
    let cues: [GenerationCue]
    let startedAt: Date
    var status: GenerationStatus = .generating
}

@Observable
@MainActor
final class StoryGenerationManager {
    /// Currently in-flight (or just-completed and not yet acknowledged)
    /// generation. Single-slot — the UI only ever exposes one Start button
    /// at a time so concurrency isn't a concern.
    var inFlight: InFlightGeneration?

    /// Kick off generation. The Task lives on the manager so it survives
    /// any view being torn down.
    @discardableResult
    func start(
        payload: StoryInputPayload,
        characters: [Character],
        cues: [GenerationCue],
        title: String
    ) -> UUID {
        let id = UUID()
        let generation = InFlightGeneration(
            id: id,
            title: title,
            cues: cues,
            startedAt: Date(),
            status: .generating
        )
        inFlight = generation

        let request = CreateStoryRequest(
            modeKey: payload.modeKey,
            characterIds: characters.map { $0.id.uuidString.lowercased() },
            input: payload.input
        )

        Task { [id] in
            do {
                let story = try await StoryAPI.create(request)
                self.markReady(id: id, story: story)
            } catch {
                let message = (error as? APIError)?.errorDescription
                    ?? error.localizedDescription
                self.markFailed(id: id, message: message)
            }
        }

        return id
    }

    /// Clears the in-flight slot. Called once the user has been navigated
    /// to the reader (or has dismissed the banner explicitly).
    func acknowledge() {
        inFlight = nil
    }

    private func markReady(id: UUID, story: StoryResponse) {
        guard inFlight?.id == id else { return }
        inFlight?.status = .ready(story)
    }

    private func markFailed(id: UUID, message: String) {
        guard inFlight?.id == id else { return }
        inFlight?.status = .failed(message)
    }
}
