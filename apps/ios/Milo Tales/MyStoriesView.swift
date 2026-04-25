//
//  MyStoriesView.swift
//  Milo Tales
//

import SwiftUI

struct MyStoriesView: View {
    @State private var vm = StoriesViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if vm.stories.isEmpty && !vm.isLoading {
                    ContentUnavailableView(
                        "No stories yet",
                        systemImage: "book",
                        description: Text("Create your first story from the home screen.")
                    )
                    .padding(.top, 80)
                } else {
                    ForEach(vm.stories) { story in
                        if story.status == .ready {
                            NavigationLink {
                                StoryReaderView(storyId: story.id)
                            } label: {
                                StoryCard(story: story)
                            }
                            .buttonStyle(.plain)
                        } else {
                            StoryCard(story: story)
                        }
                    }
                }
            }
            .padding(16)
        }
        .background(Color.gray.opacity(0.08))
        .navigationTitle("My Stories")
        .task { await vm.load() }
        .refreshable { await vm.load() }
        .alert(
            "Couldn't load stories",
            isPresented: Binding(
                get: { vm.errorMessage != nil },
                set: { if !$0 { vm.errorMessage = nil } }
            ),
            actions: { Button("OK") { vm.errorMessage = nil } },
            message: { Text(vm.errorMessage ?? "") }
        )
    }
}

private struct StoryCard: View {
    let story: StoryResponse

    private var tint: Color {
        ColorPalette.color(for: story.coverTint ?? "blue")
    }

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(tint.opacity(0.18))
                Image(systemName: story.coverSymbol ?? "book.fill")
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(tint)
            }
            .frame(width: 84, height: 84)

            VStack(alignment: .leading, spacing: 4) {
                Text(story.title ?? "Untitled story")
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(2)
                if let summary = story.summary, !summary.isEmpty {
                    Text(summary)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                HStack(spacing: 6) {
                    if story.status == .ready {
                        if let secs = story.durationSeconds, secs > 0 {
                            Image(systemName: "clock")
                            Text("\(max(1, secs / 60)) min")
                            Text("·")
                        }
                        Text(formatRelative(story.createdAt))
                    } else {
                        Image(
                            systemName: story.status == .failed
                                ? "exclamationmark.triangle.fill"
                                : "clock.arrow.circlepath"
                        )
                        Text(story.status.displayText)
                    }
                }
                .font(.caption)
                .foregroundStyle(
                    story.status == .failed
                        ? AnyShapeStyle(Color.red)
                        : AnyShapeStyle(HierarchicalShapeStyle.tertiary)
                )
                .padding(.top, 2)
            }

            Spacer(minLength: 0)
        }
        .padding(12)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .opacity(story.status == .ready ? 1 : 0.7)
    }
}

func formatRelative(_ iso: String) -> String {
    let withFractional = ISO8601DateFormatter()
    withFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let date = withFractional.date(from: iso) ?? ISO8601DateFormatter().date(from: iso)
    guard let date else { return "" }
    let rel = RelativeDateTimeFormatter()
    rel.unitsStyle = .abbreviated
    return rel.localizedString(for: date, relativeTo: Date())
}
