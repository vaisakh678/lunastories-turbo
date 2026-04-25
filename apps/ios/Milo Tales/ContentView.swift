//
//  ContentView.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import SwiftUI

enum CharacterRole {
    case main
    case side
}

struct Character: Identifiable {
    let id = UUID()
    let name: String
    let role: CharacterRole
    let symbolName: String
    let tint: Color
    let tagline: String
}

struct ContentView: View {
    private let mainCharacters: [Character] = [
        Character(name: "Milo", role: .main, symbolName: "figure.child", tint: .orange, tagline: "A curious little explorer"),
        Character(name: "Luna", role: .main, symbolName: "moon.stars.fill", tint: .purple, tagline: "Dreamy stargazer"),
        Character(name: "Finn", role: .main, symbolName: "sailboat.fill", tint: .blue, tagline: "Brave young sailor"),
    ]

    private let sideCharacters: [Character] = [
        Character(name: "Whiskers", role: .side, symbolName: "cat.fill", tint: .gray, tagline: "Loyal companion"),
        Character(name: "Hoot", role: .side, symbolName: "bird.fill", tint: .brown, tagline: "Wise night-watcher"),
        Character(name: "Pebble", role: .side, symbolName: "tortoise.fill", tint: .green, tagline: "Slow but steady"),
        Character(name: "Spark", role: .side, symbolName: "sparkles", tint: .yellow, tagline: "Lights the way"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    CharacterSection(title: "Main Characters", characters: mainCharacters)
                    CharacterSection(title: "Side Characters", characters: sideCharacters)
                }
                .padding(.vertical, 20)
            }
            .background(Color.gray.opacity(0.08))
            .navigationTitle("Milo Tales")
        }
    }
}

private struct CharacterSection: View {
    let title: String
    let characters: [Character]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title2.weight(.bold))
                .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    ForEach(characters) { character in
                        CharacterCard(character: character)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

private struct CharacterCard: View {
    let character: Character

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(character.tint.opacity(0.18))
                Image(systemName: character.symbolName)
                    .font(.system(size: 44, weight: .semibold))
                    .foregroundStyle(character.tint)
            }
            .frame(width: 140, height: 140)

            VStack(alignment: .leading, spacing: 2) {
                Text(character.name)
                    .font(.headline)
                    .foregroundStyle(.primary)
                Text(character.tagline)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
            .frame(width: 140, alignment: .leading)
        }
    }
}

#Preview {
    ContentView()
}
