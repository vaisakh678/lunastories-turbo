//
//  StoryReaderView.swift
//  Milo Tales
//

import SwiftUI
import Combine

struct StoryReaderView: View {
    let story: Story

    @State private var isFavorited = false
    @State private var isPlaying = false
    @State private var elapsedSeconds: Double = 0

    private let timer = Timer.publish(every: 0.5, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack(alignment: .bottom) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(spacing: 16) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 32, style: .continuous)
                                .fill(story.tint.opacity(0.18))
                            Image(systemName: story.symbolName)
                                .font(.system(size: 80, weight: .semibold))
                                .foregroundStyle(story.tint)
                        }
                        .frame(maxWidth: .infinity)
                        .aspectRatio(1.3, contentMode: .fit)

                        VStack(spacing: 8) {
                            Text(story.title)
                                .font(.title.weight(.bold))
                                .multilineTextAlignment(.center)
                            Text(story.summary)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)

                    VStack(alignment: .leading, spacing: 20) {
                        ForEach(story.blocks) { block in
                            switch block.kind {
                            case .text(let text):
                                Text(text)
                                    .font(.body)
                                    .lineSpacing(6)
                                    .padding(.horizontal, 24)
                            case .illustration(let symbol, let tint):
                                ZStack {
                                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                                        .fill(tint.opacity(0.18))
                                    Image(systemName: symbol)
                                        .font(.system(size: 60, weight: .semibold))
                                        .foregroundStyle(tint)
                                }
                                .frame(maxWidth: .infinity)
                                .aspectRatio(1.5, contentMode: .fit)
                                .padding(.horizontal, 24)
                            }
                        }
                    }
                }
                .padding(.bottom, 220)
            }
            .background(Color.gray.opacity(0.08))

            VStack(spacing: 0) {
                Spacer()
                AudioBar(
                    isPlaying: $isPlaying,
                    elapsed: $elapsedSeconds,
                    total: Double(story.totalSeconds)
                )
                .background(Color.white)
            }
            .ignoresSafeArea(edges: .bottom)
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    isFavorited.toggle()
                } label: {
                    Image(systemName: isFavorited ? "heart.fill" : "heart")
                        .foregroundStyle(isFavorited ? .red : .primary)
                }
                .accessibilityLabel(isFavorited ? "Unfavorite" : "Favorite")
            }
            ToolbarItem(placement: .primaryAction) {
                Button {
                    // share action
                } label: {
                    Image(systemName: "square.and.arrow.up")
                        .foregroundStyle(.primary)
                }
                .accessibilityLabel("Share")
            }
        }
        .onReceive(timer) { _ in
            guard isPlaying else { return }
            let total = Double(story.totalSeconds)
            elapsedSeconds = min(elapsedSeconds + 0.5, total)
            if elapsedSeconds >= total {
                isPlaying = false
            }
        }
    }
}

private struct AudioBar: View {
    @Binding var isPlaying: Bool
    @Binding var elapsed: Double
    let total: Double

    private func format(_ seconds: Double) -> String {
        let s = max(0, Int(seconds))
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 36) {
                Button {
                    elapsed = max(0, elapsed - 15)
                } label: {
                    Image(systemName: "gobackward.15")
                        .font(.title2)
                        .foregroundStyle(.primary)
                }

                Button {
                    isPlaying.toggle()
                } label: {
                    Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 64, height: 64)
                        .background(Circle().fill(Color.accentColor))
                }
                .accessibilityLabel(isPlaying ? "Pause" : "Play")

                Button {
                    elapsed = min(total, elapsed + 15)
                } label: {
                    Image(systemName: "goforward.15")
                        .font(.title2)
                        .foregroundStyle(.primary)
                }
            }

            VStack(spacing: 4) {
                Slider(value: $elapsed, in: 0...max(total, 1))
                    .tint(.accentColor)

                HStack {
                    Text(format(elapsed))
                    Spacer()
                    Text(format(total))
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 36)
    }
}
