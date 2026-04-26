//
//  CharacterIconView.swift
//  Milo Tales
//

import Kingfisher
import SwiftUI

func isAvatarId(_ name: String) -> Bool {
    UUID(uuidString: name) != nil
}

/// Renders a character icon — a server-managed avatar image when `symbolName`
/// is a UUID, otherwise the SF Symbol on a tinted background. Both variants
/// fill the same square footprint clipped to the given corner radius, so
/// callers can swap freely.
///
/// Avatar images are cached by Kingfisher using the avatar's `image.fileId` (the
/// stable file row id), not the URL — so the cache survives presigned-URL rotation
/// and S3 path changes.
struct CharacterIconView: View {
    let symbolName: String
    let tint: Color
    let cornerRadius: CGFloat
    let glyphPointSize: CGFloat

    @Environment(AvatarsViewModel.self) private var avatars

    var body: some View {
        ZStack {
            if isAvatarId(symbolName),
               let avatar = avatars.avatar(byId: symbolName),
               let url = URL(string: avatar.image.url) {
                KFImage.url(url, cacheKey: avatar.image.fileId)
                    .placeholder { _ in
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(tint.opacity(0.18))
                    }
                    .loadDiskFileSynchronously()
                    .fade(duration: 0.35)
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
