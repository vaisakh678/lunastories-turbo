//
//  GeneratingStoryView.swift
//  Milo Tales
//

import SwiftUI

struct GeneratingStoryRoute: Hashable {}

struct GeneratingStoryView: View {
    let onClose: () -> Void
    let onReady: () -> Void

    var body: some View {
        VStack(spacing: 28) {
            Spacer()
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.12))
                    .frame(width: 160, height: 160)
                Image(systemName: "wand.and.stars")
                    .font(.system(size: 64, weight: .semibold))
                    .foregroundStyle(.tint)
                    .symbolEffect(.pulse, options: .repeat(.continuous))
            }

            VStack(spacing: 8) {
                Text("Crafting your story…")
                    .font(.title2.weight(.bold))
                Text("Sit tight while we sprinkle in some magic.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            ProgressView()
                .controlSize(.regular)

            Spacer()
        }
        .padding(.horizontal, 32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .navigationBarBackButtonHidden(true)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                }
                .accessibilityLabel("Close")
            }
        }
        .task {
            try? await Task.sleep(for: .seconds(2.5))
            if !Task.isCancelled {
                onReady()
            }
        }
    }
}
