//
//  ModeSheetView.swift
//  Milo Tales
//

import SwiftUI

struct ModeSheetView: View {
    let characters: [Character]
    let onComplete: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var path: [String] = []   // mode titles

    private let supportedModes: Set<String> = [
        "Creative", "Inventors", "Construction Site", "Vegetable",
    ]

    var body: some View {
        NavigationStack(path: $path) {
            ChooseModeView(
                onClose: { dismiss() },
                onSelect: { mode in
                    if supportedModes.contains(mode.title) {
                        path.append(mode.title)
                    }
                    // unsupported modes are silent until specced
                }
            )
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: String.self) { modeTitle in
                modeView(for: modeTitle)
                    .toolbar(.hidden, for: .navigationBar)
                    .navigationBarBackButtonHidden(true)
            }
        }
    }

    @ViewBuilder
    private func modeView(for title: String) -> some View {
        switch title {
        case "Creative":
            CreativeModeView(
                characters: characters,
                onClose: { dismiss() },
                onBackToParent: { popPath() },
                onComplete: { handleComplete() }
            )
        case "Inventors":
            InventorsModeView(
                characters: characters,
                onClose: { dismiss() },
                onBackToParent: { popPath() },
                onComplete: { handleComplete() }
            )
        case "Construction Site":
            ConstructionSiteModeView(
                characters: characters,
                onClose: { dismiss() },
                onBackToParent: { popPath() },
                onComplete: { handleComplete() }
            )
        case "Vegetable":
            VegetableModeView(
                characters: characters,
                onClose: { dismiss() },
                onBackToParent: { popPath() },
                onComplete: { handleComplete() }
            )
        default:
            EmptyView()
        }
    }

    private func popPath() {
        if !path.isEmpty { path.removeLast() }
    }

    private func handleComplete() {
        onComplete()
        dismiss()
    }
}
