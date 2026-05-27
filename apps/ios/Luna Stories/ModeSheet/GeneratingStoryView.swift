//
//  GeneratingStoryView.swift
//  Luna Stories
//

import SwiftUI

struct GeneratingStoryRoute: Hashable {
    /// Cues are part of the route value so they reach `GeneratingStoryView`
    /// synchronously when the route is appended — avoids any state-timing
    /// gap between `@State` updates and navigation.
    let cues: [GenerationCue]
}

/// One frame in the personalized loading carousel — either an asset image
/// (mode cover / character / place artwork) or an SF symbol fallback for
/// home-grown characters that don't have illustrated artwork.
struct GenerationCue: Identifiable, Hashable {
    let id: String
    let label: String
    let imageName: String?
    let symbolName: String
    let tint: Color

    init(
        id: String = UUID().uuidString,
        label: String,
        imageName: String? = nil,
        symbolName: String = "sparkles",
        tint: Color = .accentColor
    ) {
        self.id = id
        self.label = label
        self.imageName = imageName
        self.symbolName = symbolName
        self.tint = tint
    }

    var hasImage: Bool { imageName != nil }
}

struct GeneratingStoryView: View {
    let cues: [GenerationCue]
    let onClose: () -> Void

    /// Approximate generation time in seconds. Drives the progress bar
    /// animation (caps at 95% so it doesn't look "done" before the real
    /// response lands).
    private let estimatedSeconds: Double = 10
    private let cueDuration: Double = 1.8

    @State private var progress: Double = 0
    @State private var cueIndex: Int = 0
    @State private var statusIndex: Int = 0
    @State private var breathe: Bool = false

    private let statuses: [String] = [
        "Picking the perfect words…",
        "Setting the scene…",
        "Adding a sprinkle of magic…",
        "Almost there…",
    ]

    private var currentCue: GenerationCue? {
        guard !cues.isEmpty else { return nil }
        return cues[cueIndex % cues.count]
    }

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            ZStack {
                // Outer warm halo — softly breathes opacity (no scale).
                Circle()
                    .fill(Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.32))
                    .frame(width: 220, height: 220)
                    .blur(radius: 40)
                    .opacity(breathe ? 1.0 : 0.55)
                    .animation(
                        .easeInOut(duration: 2.2).repeatForever(autoreverses: true),
                        value: breathe
                    )
                // Inner gold halo, slightly different timing for a layered feel.
                Circle()
                    .fill(Color(red: 0.96, green: 0.73, blue: 0.26).opacity(0.30))
                    .frame(width: 160, height: 160)
                    .blur(radius: 28)
                    .opacity(breathe ? 0.95 : 0.45)
                    .animation(
                        .easeInOut(duration: 1.8).repeatForever(autoreverses: true),
                        value: breathe
                    )

                cueArtwork
            }
            .frame(width: 220, height: 220)

            VStack(spacing: 10) {
                if let label = currentCue?.label {
                    Text(label)
                        .font(.title3.weight(.semibold))
                        .id("cue-\(cueIndex)")
                        .transition(.opacity)
                }
                Text(statuses[statusIndex])
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .id("status-\(statusIndex)")
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
        .background(MoodyTwilightBackground().ignoresSafeArea())
        .navigationBarBackButtonHidden(true)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                }
                .accessibilityLabel("Close")
            }
        }
        .task { await drive() }
    }

    @ViewBuilder
    private var cueArtwork: some View {
        if let cue = currentCue {
            Group {
                // Render a mode/character image when we have one — a named
                // catalog asset, or a bundled avatar when the cue's symbolName
                // is an avatar UUID (Image(systemName:) renders blank for a
                // UUID). Falls through to the SF Symbol tile otherwise.
                if let imageName = resolvedImageName(for: cue) {
                    Image(imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 132, height: 132)
                        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .strokeBorder(Color.miloCream.opacity(0.14), lineWidth: 1)
                        )
                        .shadow(color: Color.black.opacity(0.45), radius: 18, x: 0, y: 10)
                } else {
                    ZStack {
                        RoundedRectangle(cornerRadius: 28, style: .continuous)
                            .fill(cue.tint.opacity(0.32))
                            .overlay(
                                RoundedRectangle(cornerRadius: 28, style: .continuous)
                                    .strokeBorder(Color.miloCream.opacity(0.14), lineWidth: 1)
                            )
                        Image(systemName: cue.symbolName)
                            .font(.system(size: 56, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                    }
                    .frame(width: 132, height: 132)
                    .shadow(color: Color.black.opacity(0.40), radius: 16, x: 0, y: 8)
                }
            }
            .id("artwork-\(cue.id)")
            .transition(.opacity)
        }
    }

    /// The image asset to show for a cue, or nil to fall back to the SF Symbol
    /// tile. Prefers a named catalog asset; otherwise, when the cue's
    /// symbolName is an avatar UUID, the bundled "Avatars/<uuid>" image.
    private func resolvedImageName(for cue: GenerationCue) -> String? {
        if let name = cue.imageName, UIImage(named: name) != nil { return name }
        if isAvatarId(cue.symbolName),
           UIImage(named: "Avatars/\(cue.symbolName)") != nil {
            return "Avatars/\(cue.symbolName)"
        }
        return nil
    }

    private func drive() async {
        // Kick off the gentle halo breathing (opacity only — no scale).
        breathe = true

        // Drive the progress bar to ~95% over the estimated duration; the
        // last 5% lands when the response actually arrives and the screen
        // transitions to the reader.
        withAnimation(.linear(duration: estimatedSeconds)) {
            progress = 0.95
        }

        // Cue carousel — loops continuously while we wait. Slow crossfade
        // (0.7s) between cues for a calm "weaving the story" feel.
        let cueTask = Task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(cueDuration))
                if Task.isCancelled { return }
                withAnimation(.easeInOut(duration: 0.7)) {
                    cueIndex += 1
                }
            }
        }

        // Rotate the reassurance line every couple seconds.
        let stepDuration = estimatedSeconds / Double(statuses.count)
        for i in 1..<statuses.count {
            try? await Task.sleep(for: .seconds(stepDuration))
            statusIndex = i
        }

        _ = await cueTask.value
    }
}
