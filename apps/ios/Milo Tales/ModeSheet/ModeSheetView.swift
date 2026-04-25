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

    private let supportedModes: Set<String> = [
        "Creative", "Inventors", "Construction Site", "Vegetable",
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
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: StoryMode.self) { mode in
                modeView(for: mode)
                    .toolbar(.hidden, for: .navigationBar)
                    .navigationBarBackButtonHidden(true)
            }
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
                onComplete: { handleComplete() }
            )
        case "Inventors":
            InventorsModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete() }
            )
        case "Construction Site":
            ConstructionSiteModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete() }
            )
        case "Vegetable":
            VegetableModeView(
                characters: characters,
                path: $path,
                onClose: { dismiss() },
                onComplete: { handleComplete() }
            )
        default:
            EmptyView()
        }
    }

    private func handleComplete() {
        onComplete()
        dismiss()
    }
}
