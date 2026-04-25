//
//  HomeView.swift
//  Milo Tales
//

import SwiftUI

struct HomeView: View {
    @State private var mainCharacters: [Character] = [
        Character(name: "Milo", role: .main, symbolName: "figure.child", tint: .orange, tagline: "A curious little explorer"),
        Character(name: "Luna", role: .main, symbolName: "moon.stars.fill", tint: .purple, tagline: "Dreamy stargazer"),
        Character(name: "Finn", role: .main, symbolName: "sailboat.fill", tint: .blue, tagline: "Brave young sailor"),
    ]

    @State private var sideCharacters: [Character] = [
        Character(name: "Whiskers", role: .side, symbolName: "cat.fill", tint: .gray, tagline: "Loyal companion"),
        Character(name: "Hoot", role: .side, symbolName: "bird.fill", tint: .brown, tagline: "Wise night-watcher"),
        Character(name: "Pebble", role: .side, symbolName: "tortoise.fill", tint: .green, tagline: "Slow but steady"),
        Character(name: "Spark", role: .side, symbolName: "sparkles", tint: .yellow, tagline: "Lights the way"),
    ]

    @State private var addingRole: CharacterRole?
    @State private var showStoryFlow: Bool = false
    @State private var selectedCharacterIds: Set<UUID> = []

    private var selectedCharacters: [Character] {
        (mainCharacters + sideCharacters).filter { selectedCharacterIds.contains($0.id) }
    }

    private func toggle(_ character: Character) {
        if selectedCharacterIds.contains(character.id) {
            selectedCharacterIds.remove(character.id)
        } else {
            selectedCharacterIds.insert(character.id)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 28) {
                        CharacterSection(
                            role: .main,
                            characters: mainCharacters,
                            selectedIds: selectedCharacterIds,
                            onAdd: { addingRole = .main },
                            onToggle: toggle
                        )
                        CharacterSection(
                            role: .side,
                            characters: sideCharacters,
                            selectedIds: selectedCharacterIds,
                            onAdd: { addingRole = .side },
                            onToggle: toggle
                        )
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 100)
                }
                .background(Color.gray.opacity(0.08))

                VStack(spacing: 0) {
                    Spacer()
                    ZStack(alignment: .bottom) {
                        ZStack {
                            Rectangle()
                                .fill(.ultraThinMaterial)
                                .mask(
                                    LinearGradient(
                                        stops: [
                                            .init(color: .clear, location: 0),
                                            .init(color: .black.opacity(0.3), location: 0.4),
                                            .init(color: .black.opacity(0.55), location: 1),
                                        ],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )

                            Rectangle()
                                .fill(.regularMaterial)
                                .mask(
                                    LinearGradient(
                                        stops: [
                                            .init(color: .clear, location: 0),
                                            .init(color: .clear, location: 0.35),
                                            .init(color: .black.opacity(0.35), location: 0.7),
                                            .init(color: .black.opacity(0.6), location: 1),
                                        ],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                        }
                        .frame(height: 200)
                        .allowsHitTesting(false)

                        StartButton(
                            isEnabled: !selectedCharacterIds.isEmpty,
                            action: { showStoryFlow = true }
                        )
                        .padding(.horizontal, 24)
                        .padding(.bottom, 36)
                    }
                }
                .ignoresSafeArea(edges: .bottom)
            }
            .navigationTitle("Milo Tales")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    NavigationLink {
                        AccountView()
                    } label: {
                        Image(systemName: "slider.horizontal.3")
                            .font(.body.weight(.medium))
                            .foregroundStyle(.primary)
                    }
                    .accessibilityLabel("Account")
                }
            }
            .sheet(item: $addingRole) { role in
                AddCharacterSheet(role: role) { newCharacter in
                    switch role {
                    case .main: mainCharacters.append(newCharacter)
                    case .side: sideCharacters.append(newCharacter)
                    }
                }
            }
            .sheet(isPresented: $showStoryFlow) {
                ModeSheetView(characters: selectedCharacters) {
                    // wizard finished — wire to story generation later
                }
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.white)
            }
        }
    }
}

private struct StartButton: View {
    let isEnabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("Start")
                .font(.headline)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    Capsule().fill(isEnabled ? Color.accentColor : Color.gray.opacity(0.45))
                )
                .shadow(color: .black.opacity(isEnabled ? 0.18 : 0), radius: 12, x: 0, y: 6)
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }
}

private struct CharacterSection: View {
    let role: CharacterRole
    let characters: [Character]
    let selectedIds: Set<UUID>
    let onAdd: () -> Void
    let onToggle: (Character) -> Void

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(role.sectionTitle)
                .font(.title2.weight(.bold))

            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(characters) { character in
                    CharacterCard(
                        character: character,
                        isSelected: selectedIds.contains(character.id),
                        onTap: { onToggle(character) }
                    )
                }
                AddCharacterTile(action: onAdd)
                    .accessibilityLabel("Add \(role.sectionTitle)")
            }
        }
        .padding(.horizontal, 20)
    }
}

private struct AddCharacterTile: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(
                        Color.accentColor.opacity(0.5),
                        style: StrokeStyle(lineWidth: 1.5, dash: [6, 4])
                    )
                Image(systemName: "plus")
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(.tint)
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(1, contentMode: .fit)
        }
        .buttonStyle(.plain)
    }
}

private struct CharacterCard: View {
    let character: Character
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 6) {
                ZStack(alignment: .topTrailing) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .fill(character.tint.opacity(0.18))
                        Image(systemName: character.symbolName)
                            .font(.system(size: 30, weight: .semibold))
                            .foregroundStyle(character.tint)
                    }
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(
                                isSelected ? Color.accentColor : Color.clear,
                                lineWidth: 3
                            )
                    )

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(.white, Color.accentColor)
                            .padding(6)
                    }
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)

                VStack(alignment: .leading, spacing: 1) {
                    Text(character.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                        .lineLimit(1)
                    Text(character.tagline)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .buttonStyle(.plain)
    }
}
