//
//  ModeSheetView.swift
//  Milo Tales
//

import SwiftUI

struct ModeSheetView: View {
    let characters: [Character]
    let onComplete: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var path = NavigationPath()
    @State private var errorMessage: String?

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
                GeneratingStoryView(cues: route.cues, onClose: { dismiss() })
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
        path.append(GeneratingStoryRoute(cues: homeCues + cues))
        let request = CreateStoryRequest(
            modeKey: payload.modeKey,
            characterIds: characters.map { $0.id.uuidString.lowercased() },
            input: payload.input
        )
        Task {
            do {
                _ = try await StoryAPI.create(request)
                onComplete()
                dismiss()
            } catch {
                errorMessage = (error as? APIError)?.errorDescription
                    ?? error.localizedDescription
            }
        }
    }
}
