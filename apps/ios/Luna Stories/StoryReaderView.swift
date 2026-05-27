//
//  StoryReaderView.swift
//  Luna Stories
//

import SwiftUI

struct StoryReaderView: View {
    let storyId: String

    @State private var story: StoryResponse?
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var isFavorited = false
    @State private var isGeneratingAudio = false
    @State private var audioErrorMessage: String?
    @State private var audioPlayer = StoryAudioPlayer()
    @State private var isMakingAnother: Bool = false
    @State private var usage = UsageViewModel()
    @Environment(ToastCenter.self) private var toast

    var body: some View {
        Group {
            if let story, story.status == .ready {
                readerContent(for: story)
            } else if let story, story.status == .failed {
                failedView(message: story.errorMessage)
            } else if story != nil {
                generatingView()
            } else if isLoading {
                ProgressView()
                    .controlSize(.large)
            } else if let errorMessage {
                errorView(errorMessage)
            } else {
                Color.clear
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(MoodyTwilightBackground().ignoresSafeArea())
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        #endif
        .toolbar {
            if story?.status == .ready {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        isFavorited.toggle()
                    } label: {
                        Image(systemName: isFavorited ? "heart.fill" : "heart")
                            .foregroundStyle(isFavorited ? .red : .primary)
                    }
                    .accessibilityLabel(isFavorited ? "Unfavorite" : "Favorite")
                }
            }
        }
        .task { await load() }
        .onChange(of: story?.audio?.url) { _, newURL in
            guard let s = newURL, let url = URL(string: s) else { return }
            audioPlayer.load(
                url: url,
                fallbackTotal: Double(story?.durationSeconds ?? 0)
            )
        }
        .onDisappear { audioPlayer.teardown() }
        .alert(
            "Audio generation failed",
            isPresented: Binding(
                get: { audioErrorMessage != nil },
                set: { if !$0 { audioErrorMessage = nil } }
            ),
            actions: { Button("OK") { audioErrorMessage = nil } },
            message: { Text(audioErrorMessage ?? "") }
        )
    }

    @ViewBuilder
    private func readerContent(for story: StoryResponse) -> some View {
        let tint = ColorPalette.color(for: story.coverTint ?? "blue")
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    storyHero(story: story, tint: tint)

                    storyPage(story: story, tint: tint)
                        .padding(.horizontal, 16)

                    MakeAnotherCard(
                        isLoading: isMakingAnother,
                        action: { Task { await makeAnother(from: story) } }
                    )
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                }
                .padding(.bottom, 220)
            }

            audioBar(for: story)
                .padding(.bottom, 12)
                .background(
                    audioBarBackground
                        .ignoresSafeArea(edges: .bottom)
                )
        }
    }

    /// Hero block — sits on the moody twilight bg with cream chrome.
    /// Adds a soft warm halo behind the cover icon to echo the splash.
    private func storyHero(story: StoryResponse, tint: Color) -> some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.28))
                    .frame(maxWidth: 280, maxHeight: 280)
                    .blur(radius: 50)
                StoryCoverGrid(
                    icons: story.coverIcons ?? [],
                    fallbackSymbol: story.coverSymbol ?? "book.fill",
                    tint: tint,
                    glyphPointSize: 56
                )
                .frame(maxWidth: .infinity)
                .aspectRatio(1.3, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 32, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 32, style: .continuous)
                        .strokeBorder(Color.miloCream.opacity(0.14), lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.45), radius: 24, x: 0, y: 12)
            }

            VStack(spacing: 8) {
                Text(story.title ?? "Untitled")
                    .font(.title.weight(.bold))
                    .foregroundStyle(Color.miloCream)
                    .multilineTextAlignment(.center)
                if let summary = story.summary, !summary.isEmpty {
                    Text(summary)
                        .font(.subheadline)
                        .foregroundStyle(Color.miloCream.opacity(0.65))
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
    }

    /// The actual story prose lives on a warm "paper" surface so reading
    /// long-form text doesn't fight the dark backdrop. Contrast is what
    /// matters most for a prose body — kept as deep slate on cream paper.
    private func storyPage(story: StoryResponse, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 22) {
            if let blocks = story.content?.blocks {
                ForEach(Array(blocks.enumerated()), id: \.offset) { _, block in
                    switch block {
                    case .text(let text):
                        Text(text)
                            .font(.system(size: 19))
                            .lineSpacing(9)
                            .foregroundStyle(Color.miloInk)
                    case .illustration(let symbol, let blockTint):
                        let resolvedTint = ColorPalette.color(for: blockTint)
                        ZStack {
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .fill(resolvedTint.opacity(0.16))
                            Image(systemName: symbol)
                                .font(.system(size: 60, weight: .semibold))
                                .foregroundStyle(resolvedTint)
                        }
                        .frame(maxWidth: .infinity)
                        .aspectRatio(1.5, contentMode: .fit)
                    }
                }
            } else if let body = story.bodyText {
                Text(body)
                    .font(.system(size: 19))
                    .lineSpacing(9)
                    .foregroundStyle(Color.miloInk)
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 28)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(Color.miloPaper)
        )
        .shadow(color: Color.black.opacity(0.30), radius: 22, x: 0, y: 10)
    }

    private var audioBarBackground: some View {
        // Soft glass that blends with the moody bg above and the home
        // indicator area below, instead of a hard white slab.
        Rectangle()
            .fill(.ultraThinMaterial)
            .overlay(Rectangle().fill(Color.black.opacity(0.10)))
    }

    @ViewBuilder
    private func audioBar(for story: StoryResponse) -> some View {
        if story.audio != nil {
            AudioPlayerBar(player: audioPlayer)
        } else {
            GenerateAudioBar(
                isGenerating: isGeneratingAudio,
                action: { Task { await generateAudio() } }
            )
        }
    }

    private func generatingView() -> some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
            Text("Still preparing this story…")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private func failedView(message: String?) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text("Couldn't generate this story")
                .font(.headline)
            if let message {
                Text(message)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
        }
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "wifi.exclamationmark")
                .font(.largeTitle)
                .foregroundStyle(.secondary)
            Text("Couldn't load story")
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Button("Retry") {
                Task { await load() }
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private func load() async {
        isLoading = true
        errorMessage = nil
        do {
            story = try await StoryAPI.get(storyId)
            // Stamp this story as opened (idempotent on the server). Fire
            // and forget — a failed mark shouldn't disrupt reading.
            Task { try? await StoryAPI.markAsRead(storyId) }
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }

    private func generateAudio() async {
        isGeneratingAudio = true
        audioErrorMessage = nil
        defer { isGeneratingAudio = false }
        do {
            story = try await StoryAPI.generateAudio(storyId)
            // Narration just landed — refresh usage and warn once weekly audio
            // crosses 80% (but isn't fully spent). The exhausted/400 case is
            // surfaced via audioErrorMessage below.
            await usage.refresh()
            if let audio = usage.summary?.audio,
               audio.percentUsed >= 80, audio.remaining > 0 {
                toast.show(
                    audio.message,
                    title: "Running low on audio",
                    style: .warning,
                    progress: Double(audio.percentUsed) / 100,
                    duration: 5,
                )
            }
        } catch {
            audioErrorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }

    /// Re-runs story generation with the same characters, mode, and inputs as
    /// the current story. Replaces the in-memory story with the new one;
    /// the original is preserved on the backend so it still appears in My Stories.
    private func makeAnother(from existing: StoryResponse) async {
        guard let charIds = existing.characterIds, !charIds.isEmpty else { return }
        isMakingAnother = true
        defer { isMakingAnother = false }
        do {
            let request = CreateStoryRequest(
                modeKey: existing.modeKey,
                characterIds: charIds,
                input: existing.generationInput ?? .object([:])
            )
            let created = try await StoryAPI.create(request)
            // Tear down current audio (new story has no audio yet) and swap.
            audioPlayer.teardown()
            story = created
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }
}

private struct MakeAnotherCard: View {
    let isLoading: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Color.accentColor.opacity(0.32))
                        .frame(width: 44, height: 44)
                    if isLoading {
                        ProgressView().tint(Color.miloCream)
                    } else {
                        Image(systemName: "sparkles")
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                    }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(isLoading ? "Crafting another…" : "Make another with these heroes")
                        .font(.headline)
                        .foregroundStyle(Color.miloCream)
                    Text("Same characters & mode, brand-new tale")
                        .font(.caption)
                        .foregroundStyle(Color.miloCream.opacity(0.65))
                }
                Spacer(minLength: 8)
                Image(systemName: "chevron.right")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Color.miloCream.opacity(0.5))
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(Color.accentColor.opacity(0.10))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(Color.accentColor.opacity(0.30), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .disabled(isLoading)
    }
}

private struct GenerateAudioBar: View {
    let isGenerating: Bool
    let action: () -> Void

    var body: some View {
        VStack(spacing: 8) {
            Button(action: action) {
                HStack(spacing: 10) {
                    if isGenerating {
                        ProgressView()
                            .controlSize(.small)
                            .tint(.white)
                        Text("Generating audio…")
                    } else {
                        Image(systemName: "waveform.badge.plus")
                        Text("Generate Audio")
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    Capsule().fill(
                        isGenerating ? Color.gray.opacity(0.5) : Color.accentColor
                    )
                )
            }
            .buttonStyle(.plain)
            .disabled(isGenerating)

            if !isGenerating {
                Text("Takes about 10–15 seconds.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        // .padding(.bottom, 16)
    }
}

private struct AudioPlayerBar: View {
    let player: StoryAudioPlayer

    private func format(_ seconds: Double) -> String {
        let s = max(0, Int(seconds))
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 36) {
                Button {
                    player.skip(by: -15)
                } label: {
                    Image(systemName: "gobackward.15")
                        .font(.title2)
                        .foregroundStyle(.primary)
                }

                Button {
                    player.togglePlay()
                } label: {
                    Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 64, height: 64)
                        .background(Circle().fill(Color.accentColor))
                }
                .accessibilityLabel(player.isPlaying ? "Pause" : "Play")

                Button {
                    player.skip(by: 15)
                } label: {
                    Image(systemName: "goforward.15")
                        .font(.title2)
                        .foregroundStyle(.primary)
                }
            }

            VStack(spacing: 4) {
                Slider(
                    value: Binding(
                        get: { player.elapsed },
                        set: { player.seek(to: $0) }
                    ),
                    in: 0...max(player.total, 1)
                )
                .tint(.accentColor)

                HStack {
                    Text(format(player.elapsed))
                    Spacer()
                    Text(format(player.total))
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        // .padding(.bottom, 36)
    }
}
