//
//  CharacterIconView.swift
//  Milo Tales
//

import SwiftUI

func isAvatarId(_ name: String) -> Bool {
    UUID(uuidString: name) != nil
}

/// Renders a character icon — a server-managed avatar image when `symbolName`
/// is a UUID, otherwise the SF Symbol on a tinted background. Both variants
/// fill the same square footprint clipped to the given corner radius, so
/// callers can swap freely.
struct CharacterIconView: View {
    let symbolName: String
    let tint: Color
    let cornerRadius: CGFloat
    let glyphPointSize: CGFloat

    @Environment(AvatarsViewModel.self) private var avatars

    var body: some View {
        ZStack {
            if isAvatarId(symbolName), let url = avatars.url(forCharacterIcon: symbolName) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(tint.opacity(0.18))
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        fallbackSymbol("person.fill")
                    @unknown default:
                        fallbackSymbol("person.fill")
                    }
                }
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
