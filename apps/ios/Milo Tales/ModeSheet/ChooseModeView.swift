//
//  ChooseModeView.swift
//  Milo Tales
//

import SwiftUI

struct StoryMode: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let symbolName: String
    let tint: Color
}

struct ChooseModeView: View {
    let onClose: () -> Void
    let onSelect: (StoryMode) -> Void

    private let modes: [StoryMode] = [
        StoryMode(title: "Creative",            symbolName: "paintpalette.fill",       tint: .pink),
        StoryMode(title: "Inventors",           symbolName: "lightbulb.fill",          tint: .yellow),
        StoryMode(title: "Construction Site",   symbolName: "hammer.fill",             tint: .orange),
        StoryMode(title: "Vegetable",           symbolName: "leaf.fill",               tint: .green),
        StoryMode(title: "Environment",         symbolName: "globe.americas.fill",     tint: .blue),
        StoryMode(title: "Jungle Book",         symbolName: "pawprint.fill",           tint: .brown),
        StoryMode(title: "Alice in Wonderland", symbolName: "cup.and.saucer.fill",     tint: .purple),
        StoryMode(title: "Grimm's Tales",       symbolName: "book.closed.fill",        tint: .indigo),
        StoryMode(title: "Wizard of Oz",        symbolName: "tornado",                 tint: .teal),
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
        .modeStepChrome(onClose: onClose)
    }
}

private struct ModeTile: View {
    let mode: StoryMode
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(mode.tint.opacity(0.18))
                    Image(systemName: mode.symbolName)
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(mode.tint)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)

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
