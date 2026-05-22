//
//  CharacterIconView.swift
//  Luna Stories
//

import SwiftUI

func isAvatarId(_ name: String) -> Bool {
    UUID(uuidString: name) != nil
}

/// Renders a character icon — a bundled avatar image (HEIC asset in the
/// Avatars/ namespace) when `symbolName` is a UUID, otherwise the SF Symbol
/// on a tinted background. Both variants fill the same square footprint
/// clipped to the given corner radius, so callers can swap freely.
struct CharacterIconView: View {
    let symbolName: String
    let tint: Color
    let cornerRadius: CGFloat
    let glyphPointSize: CGFloat

    var body: some View {
        ZStack {
            if isAvatarId(symbolName) {
                Image("Avatars/\(symbolName)")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                fallbackSymbol(symbolName)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }

    @ViewBuilder
    private func fallbackSymbol(_ name: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .fill(tint.opacity(0.18))
            Image(systemName: name)
                .font(.system(size: glyphPointSize, weight: .semibold))
                .foregroundStyle(tint)
        }
    }
}
