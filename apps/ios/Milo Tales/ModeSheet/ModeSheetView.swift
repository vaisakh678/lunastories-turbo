//
//  ModeSheetView.swift
//  Milo Tales
//

import SwiftUI

struct ModeSheetView: View {
    let characters: [Character]
    /// Called when the story has finished AND the user is still on this
    /// modal — carries the freshly created story so the caller can push
    /// the reader. If the user has already dismissed the modal early, the
    /// HomeView banner takes over instead and this never fires.
    let onComplete: (StoryResponse) -> Void

    @Environment(\.dismiss) private var dismiss
    @Environment(StoryGenerationManager.self) private var generations
    @State private var path = NavigationPath()
    @State private var errorMessage: String?
    /// The id of the in-flight generation we kicked off, so we only react
    /// to OUR generation finishing (not some other one already in flight).
    @State private var generationId: UUID?

    private let supportedModes: Set<String> = [
        "Creative", "Inventors", "Construction Site", "Vegetable", "Environment",
        "Jungle Book", "Alice in Wonderland", "Grimm's Tales", "Wizard of Oz",
    ]

    var body: some View {
        NavigationStack(path: $path) {
            ChooseModeView(
                onClose: { dismiss() },
                onSelect: { mode in
                    if supportedModes.contains(mode.title) {
                        path.append(mode)
                    }
                }
            )
            .navigationDestination(for: StoryMode.self) { mode in
                modeView(for: mode)
            }
            .navigationDestination(for: GeneratingStoryRoute.self) { route in
                GeneratingStoryView(
                    cues: route.cues,
                    onClose: {
                        // Just dismiss — the manager keeps generating, and
                        // the HomeView banner picks up the in-flight story
                        // so the user can tap back into it when ready.
                        dismiss()
                    }
                )
            }
        }
        .alert(
            "Couldn't start your story",
            isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            ),
            actions: { Button("OK") { errorMessage = nil } },
            message: { Text(errorMessage ?? "") }
        )
        // When OUR generation finishes while the modal is still up, push
        // the reader and dismiss. If the user has already dismissed early,
        // ModeSheetView is gone and this onChange never fires — the
        // HomeView banner handles the ready-state instead.
        .onChange(of: generations.inFlight?.status.kind) { _, _ in
            guard
                let inFlight = generations.inFlight,
                inFlight.id == generationId,
                let story = inFlight.status.readyStory
            else { return }
            onComplete(story)
            generations.acknowledge()
            dismiss()
        }
    }

    @ViewBuilder
    private func modeView(for mode: StoryMode) -> some View {
        switch mode.title {
        case "Creative":
            CreativeModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Inventors":
            InventorsModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Construction Site":
            ConstructionSiteModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Vegetable":
            VegetableModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Environment":
            EnvironmentModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Jungle Book":
            JungleBookModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Alice in Wonderland":
            AliceInWonderlandModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Grimm's Tales":
            GrimmsTalesModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        case "Wizard of Oz":
            WizardOfOzModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete($0, cues: $1) }
            )
        default:
            EmptyView()
        }
    }

    private func handleComplete(_ payload: StoryInputPayload, cues: [GenerationCue]) {
        // Prepend the user's home characters as cues so the carousel feels
        // personal — "your story is being made for you and your kid."
        let homeCues: [GenerationCue] = characters.map { c in
            GenerationCue(
                id: "char-\(c.id.uuidString)",
                label: c.name,
                imageName: nil,
                symbolName: c.symbolName,
                tint: c.tint
            )
        }
        let allCues = homeCues + cues
        path.append(GeneratingStoryRoute(cues: allCues))
        // Hand the API call off to the global manager so the generation
        // survives the modal being dismissed.
        generationId = generations.start(
            payload: payload,
            characters: characters,
            cues: allCues,
            title: bannerTitle(forCues: cues)
        )
    }

    /// First non-home cue's label is usually the most descriptive ("Jungle
    /// Book", "Mowgli", "Bamboo Grove" — depending on which step led here).
    /// Falls back to a generic label if nothing fits.
    private func bannerTitle(forCues cues: [GenerationCue]) -> String {
        cues.first?.label ?? "Your story"
    }
}
