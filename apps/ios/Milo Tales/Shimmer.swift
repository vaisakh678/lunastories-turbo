//
//  Shimmer.swift
//  Milo Tales
//
//  Currently a no-op modifier — skeleton placeholders render statically (just
//  flat gray bars). The call sites still use `.shimmering()` so we can swap
//  the implementation back to an animated sheen or a pulse here without
//  touching every skeleton view.
//

import SwiftUI

extension View {
    func shimmering() -> some View { self }
}
