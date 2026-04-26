//
//  ChooseModeView.swift
//  Milo Tales
//

import SwiftUI

struct StoryMode: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let symbolName: String
    let imageName: String
    let tint: Color
}

struct ChooseModeView: View {
    let onClose: () -> Void
    let onSelect: (StoryMode) -> Void

    private let modes: [StoryMode] = [
        StoryMode(title: "Creative",            symbolName: "paintpalette.fill",   imageName: "creative",            tint: .pink),
        StoryMode(title: "Inventors",           symbolName: "lightbulb.fill",      imageName: "inventors",           tint: .yellow),
        StoryMode(title: "Construction Site",   symbolName: "hammer.fill",         imageName: "construction_site",   tint: .orange),
        StoryMode(title: "Vegetable",           symbolName: "leaf.fill",           imageName: "vegetables",          tint: .green),
        StoryMode(title: "Environment",         symbolName: "globe.americas.fill", imageName: "environment",         tint: .blue),
        StoryMode(title: "Jungle Book",         symbolName: "pawprint.fill",       imageName: "jungle_book",         tint: .brown),
        StoryMode(title: "Alice in Wonderland", symbolName: "cup.and.saucer.fill", imageName: "alice_in_wonderland", tint: .purple),
        StoryMode(title: "Grimm's Tales",       symbolName: "book.closed.fill",    imageName: "grimms_tales",        tint: .indigo),
        StoryMode(title: "Wizard of Oz",        symbolName: "tornado",             imageName: "wizard_of_oz",        tint: .teal),
    ]

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VStack(spacing: 6) {
                    Text("Choose a mode")
                        .font(.title2.weight(.bold))
                    Text("Pick a theme for your next story.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 8)
                .padding(.bottom, 20)

                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(modes) { mode in
                        ModeTile(mode: mode) { onSelect(mode) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: true, onClose: onClose)
    }
}

private struct ModeTile: View {
    let mode: StoryMode
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Color.clear
                    .aspectRatio(1, contentMode: .fit)
                    .overlay(
                        Image(mode.imageName)
                            .resizable()
                            .scaledToFill()
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                Text(mode.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity)
            }
        }
        .buttonStyle(.plain)
    }
}
