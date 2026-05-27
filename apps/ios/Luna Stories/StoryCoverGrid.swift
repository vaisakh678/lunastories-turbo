//
//  StoryCoverGrid.swift
//  Luna Stories
//
//  A story cover that collages the story's characters (1–4 of them) into the
//  cover square/rect. Falls back to the single cover SF Symbol when a story
//  has no characters. Used by the My Stories list card and the reader hero.
//  Tiles use CharacterIconView so bundled avatar images render, not just SF
//  Symbols. The caller is responsible for the outer frame + corner clipping.
//

import SwiftUI

struct StoryCoverGrid: View {
    let icons: [CoverIcon]
    let fallbackSymbol: String
    /// Resolved cover tint, used for the no-characters fallback tile.
    let tint: Color
    var glyphPointSize: CGFloat = 22

    private let gap: CGFloat = 2
    private var capped: [CoverIcon] { Array(icons.prefix(4)) }

    var body: some View {
        if capped.isEmpty {
            fallback
        } else {
            grid
        }
    }

    private var fallback: some View {
        ZStack {
            Rectangle().fill(tint.opacity(0.18))
            Image(systemName: fallbackSymbol)
                .font(.system(size: glyphPointSize * 1.5, weight: .semibold))
                .foregroundStyle(tint)
        }
    }

    @ViewBuilder
    private var grid: some View {
        switch capped.count {
        case 1:
            tile(capped[0])
        case 2:
            HStack(spacing: gap) { tile(capped[0]); tile(capped[1]) }
        case 3:
            HStack(spacing: gap) {
                tile(capped[0])
                VStack(spacing: gap) { tile(capped[1]); tile(capped[2]) }
            }
        default:
            VStack(spacing: gap) {
                HStack(spacing: gap) { tile(capped[0]); tile(capped[1]) }
                HStack(spacing: gap) { tile(capped[2]); tile(capped[3]) }
            }
        }
    }

    private func tile(_ icon: CoverIcon) -> some View {
        CharacterIconView(
            symbolName: icon.symbolName,
            tint: ColorPalette.color(for: icon.tint),
            cornerRadius: 0,
            glyphPointSize: glyphPointSize
        )
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()
    }
}
