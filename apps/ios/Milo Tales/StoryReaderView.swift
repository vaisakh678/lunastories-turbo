//
//  StoryReaderView.swift
//  Milo Tales
//

import SwiftUI

struct StoryReaderView: View {
    let storyId: String

    @State private var story: StoryResponse?
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var isFavorited = false

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
        .background(Color.gray.opacity(0.08))
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
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
    }

    @ViewBuilder
    private func readerContent(for story: StoryResponse) -> some View {
        let tint = ColorPalette.color(for: story.coverTint ?? "blue")
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(spacing: 16) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 32, style: .continuous)
                            .fill(tint.opacity(0.18))
                        Image(systemName: story.coverSymbol ?? "book.fill")
                            .font(.system(size: 80, weight: .semibold))
                            .foregroundStyle(tint)
                    }
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1.3, contentMode: .fit)

                    VStack(spacing: 8) {
                        Text(story.title ?? "Untitled")
                            .font(.title.weight(.bold))
                            .multilineTextAlignment(.center)
                        if let summary = story.summary, !summary.isEmpty {
                            Text(summary)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                VStack(alignment: .leading, spacing: 20) {
                    if let blocks = story.content?.blocks {
                        ForEach(Array(blocks.enumerated()), id: \.offset) { _, block in
                            switch block {
                            case .text(let text):
                                Text(text)
                                    .font(.body)
                                    .lineSpacing(6)
                                    .padding(.horizontal, 24)
                            case .illustration(let symbol, let blockTint):
                                let resolvedTint = ColorPalette.color(for: blockTint)
                                ZStack {
                                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                                        .fill(resolvedTint.opacity(0.18))
                                    Image(systemName: symbol)
                                        .font(.system(size: 60, weight: .semibold))
                                        .foregroundStyle(resolvedTint)
                                }
                                .frame(maxWidth: .infinity)
                                .aspectRatio(1.5, contentMode: .fit)
                                .padding(.horizontal, 24)
                            }
                        }
                    } else if let body = story.bodyText {
                        Text(body)
                            .font(.body)
                            .lineSpacing(6)
                            .padding(.horizontal, 24)
                    }
                }
                .padding(.bottom, 60)
            }
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
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
        isLoading = false
    }
}
