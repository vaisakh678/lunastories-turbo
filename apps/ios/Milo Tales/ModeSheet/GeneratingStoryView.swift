//
//  GeneratingStoryView.swift
//  Milo Tales
//

import SwiftUI

struct GeneratingStoryRoute: Hashable {}

struct GeneratingStoryView: View {
    let onClose: () -> Void

    /// Approximate generation time in seconds. Drives the progress bar
    /// animation (caps at 95% so it doesn't look "done" before the real
    /// response lands).
    private let estimatedSeconds: Double = 10

    @State private var progress: Double = 0
    @State private var statusIndex: Int = 0

    private let statuses: [String] = [
        "Picking the perfect words…",
        "Setting the scene…",
        "Adding a sprinkle of magic…",
        "Almost there…",
    ]

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
                Text(statuses[statusIndex])
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .id(statusIndex)
                    .transition(.opacity)
                    .animation(.easeInOut(duration: 0.4), value: statusIndex)
            }

            VStack(spacing: 6) {
                ProgressView(value: progress)
                    .progressViewStyle(.linear)
                    .tint(Color.accentColor)
                    .frame(maxWidth: 280)
                Text("About \(Int(estimatedSeconds)) seconds")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

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
            // Drive the progress bar to ~95% over the estimated duration; the
            // last 5% lands when the response actually arrives and the screen
            // transitions to the reader.
            withAnimation(.linear(duration: estimatedSeconds)) {
                progress = 0.95
            }
            // Rotate the reassurance line every couple seconds.
            let stepDuration = estimatedSeconds / Double(statuses.count)
            for i in 1..<statuses.count {
                try? await Task.sleep(for: .seconds(stepDuration))
                statusIndex = i
            }
        }
    }
}
