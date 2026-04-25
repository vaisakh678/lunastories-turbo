//
//  MyStoriesView.swift
//  Milo Tales
//

import SwiftUI

struct MyStoriesView: View {
    private let stories: [Story] = [
        Story(title: "Milo and the Moon Cookie",
              summary: "A bedtime adventure through a cinnamon-scented sky.",
              symbolName: "moon.stars.fill",
              tint: .purple,
              duration: "5 min",
              createdAt: "Today",
              totalSeconds: 300,
              blocks: [
                .init(kind: .text("Milo woke up to a soft humming sound. Outside his window, the moon was singing a song made of cinnamon and stardust.")),
                .init(kind: .text("He tiptoed to the sill, climbed onto a cloud-shaped stool, and reached for the night sky.")),
                .init(kind: .illustration(symbolName: "moon.stars.fill", tint: .purple)),
                .init(kind: .text("In his hand he held a tiny moon cookie, warm and round, with sugar sprinkled like little stars.")),
                .init(kind: .text("\"One bite for courage,\" he whispered, \"and one for wishes.\" The cookie giggled.")),
                .init(kind: .illustration(symbolName: "sparkles", tint: .yellow)),
                .init(kind: .text("That night Milo dreamed of cinnamon clouds, jumping over them all the way until morning.")),
              ]),
        Story(title: "Luna's Stargazing Trip",
              summary: "Luna discovers a constellation that hums lullabies.",
              symbolName: "sparkles",
              tint: .indigo,
              duration: "7 min",
              createdAt: "Yesterday",
              totalSeconds: 420,
              blocks: [
                .init(kind: .text("Luna packed her telescope, three blankets, and a thermos of warm cocoa. Tonight she would find the Singing Star.")),
                .init(kind: .illustration(symbolName: "binoculars.fill", tint: .indigo)),
                .init(kind: .text("On the hill behind her house, she pointed her telescope upward and listened very, very carefully.")),
                .init(kind: .text("A tiny tune drifted down — high notes like silver bells. Luna smiled. The constellation was humming a lullaby just for her.")),
                .init(kind: .illustration(symbolName: "moon.stars.fill", tint: .purple)),
                .init(kind: .text("She closed her eyes and listened until the stars sang her gently to sleep.")),
              ]),
        Story(title: "Finn Sails the Rainbow Sea",
              summary: "A brave little sailor charts a course to Color Island.",
              symbolName: "sailboat.fill",
              tint: .blue,
              duration: "6 min",
              createdAt: "2 days ago",
              totalSeconds: 360,
              blocks: [
                .init(kind: .text("Finn raised the sails of his little boat and pushed off from the cinnamon shore.")),
                .init(kind: .illustration(symbolName: "sailboat.fill", tint: .blue)),
                .init(kind: .text("The sea ahead shimmered in stripes of red, orange, yellow, green, blue, indigo, and violet.")),
                .init(kind: .text("\"Color Island, here I come!\" he called as a friendly wind nudged him forward.")),
                .init(kind: .illustration(symbolName: "rainbow", tint: .pink)),
                .init(kind: .text("By sundown Finn dropped anchor at a beach made of crayons, where every wave painted the sand a new color.")),
              ]),
        Story(title: "Whiskers Finds the Cozy Hat",
              summary: "A curious cat searches the attic for the perfect winter hat.",
              symbolName: "cat.fill",
              tint: .orange,
              duration: "4 min",
              createdAt: "Last week",
              totalSeconds: 240,
              blocks: [
                .init(kind: .text("Whiskers padded up the dusty attic stairs, tail twitching. Somewhere up here was the perfect hat.")),
                .init(kind: .illustration(symbolName: "cat.fill", tint: .orange)),
                .init(kind: .text("She tried a top hat (too tall), a sunhat (too floppy), and a cowboy hat (too jingly).")),
                .init(kind: .text("Then, in the very last box, she found a tiny knitted beanie with a pom-pom. Purrrfect.")),
              ]),
        Story(title: "Hoot's Midnight Library",
              summary: "An owl who reads to the stars opens a secret door.",
              symbolName: "bird.fill",
              tint: .brown,
              duration: "8 min",
              createdAt: "Last week",
              totalSeconds: 480,
              blocks: [
                .init(kind: .text("Every night when the clock struck twelve, Hoot the owl unlocked his secret library in the old oak tree.")),
                .init(kind: .illustration(symbolName: "books.vertical.fill", tint: .brown)),
                .init(kind: .text("He chose a book, opened it slowly, and began to read aloud — softly, just for the stars.")),
                .init(kind: .text("Tonight, behind the very last shelf, he found a door he had never seen before. It glowed gently.")),
                .init(kind: .illustration(symbolName: "door.left.hand.open", tint: .yellow)),
                .init(kind: .text("Hoot pushed it open and stepped inside, and a brand-new story began.")),
              ]),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                ForEach(stories) { story in
                    NavigationLink {
                        StoryReaderView(story: story)
                    } label: {
                        StoryCard(story: story)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(16)
        }
        .background(Color.gray.opacity(0.08))
        .navigationTitle("My Stories")
    }
}

private struct StoryCard: View {
    let story: Story

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(story.tint.opacity(0.18))
                Image(systemName: story.symbolName)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(story.tint)
            }
            .frame(width: 84, height: 84)

            VStack(alignment: .leading, spacing: 4) {
                Text(story.title)
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(2)
                Text(story.summary)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                HStack(spacing: 6) {
                    Image(systemName: "clock")
                    Text(story.duration)
                    Text("·")
                    Text(story.createdAt)
                }
                .font(.caption)
                .foregroundStyle(.tertiary)
                .padding(.top, 2)
            }

            Spacer(minLength: 0)
        }
        .padding(12)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
