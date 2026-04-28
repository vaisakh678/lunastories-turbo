//
//  HomeView.swift
//  Milo Tales
//

import SwiftUI

struct HomeView: View {
    @State private var vm = CharactersViewModel()
    @Environment(StoryGenerationManager.self) private var generations
    @State private var addingRole: CharacterRole?
    @State private var editingCharacter: Character?
    @State private var showStoryFlow: Bool = false
    @State private var selectedCharacterIds: Set<UUID> = []
    @State private var navigationPath = NavigationPath()

    private var selectedCharacters: [Character] {
        vm.characters.filter { selectedCharacterIds.contains($0.id) }
    }

    private func toggle(_ character: Character) {
        if selectedCharacterIds.contains(character.id) {
            selectedCharacterIds.remove(character.id)
        } else {
            selectedCharacterIds.insert(character.id)
        }
    }

    private func handleBannerTap(_ inFlight: InFlightGeneration) {
        if let story = inFlight.status.readyStory {
            navigationPath.append(HomeRoute.story(id: story.id))
            generations.acknowledge()
        }
        // While still generating, the tap is a no-op for now. We could
        // re-open the modal at the generating step here later.
    }

    var body: some View {
        NavigationStack(path: $navigationPath) {
            ZStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        if let inFlight = generations.inFlight {
                            GenerationBanner(
                                inFlight: inFlight,
                                onTap: { handleBannerTap(inFlight) },
                                onDismiss: { generations.acknowledge() }
                            )
                            .padding(.horizontal, 20)
                            .transition(.move(edge: .top).combined(with: .opacity))
                        }
                        if vm.isLoading {
                            CharacterSectionSkeleton(role: .main)
                            CharacterSectionSkeleton(role: .side)
                        } else {
                            CharacterSection(
                                role: .main,
                                characters: vm.mainCharacters,
                                selectedIds: selectedCharacterIds,
                                onAdd: { addingRole = .main },
                                onToggle: toggle,
                                onEdit: { editingCharacter = $0 }
                            )
                            CharacterSection(
                                role: .side,
                                characters: vm.sideCharacters,
                                selectedIds: selectedCharacterIds,
                                onAdd: { addingRole = .side },
                                onToggle: toggle,
                                onEdit: { editingCharacter = $0 }
                            )
                        }
                    }
                    .padding(.top, 20)
                    .padding(.bottom, 100)
                }
                .background(MoodyTwilightBackground().ignoresSafeArea())

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
                CharacterWizardSheet(role: role) { newCharacter in
                    Task {
                        await vm.add(
                            CreateCharacterRequest(
                                role: newCharacter.role,
                                name: newCharacter.name,
                                symbolName: newCharacter.symbolName,
                                tint: newCharacter.tintName,
                                tagline: newCharacter.tagline.isEmpty ? nil : newCharacter.tagline,
                                age: newCharacter.age,
                                gender: newCharacter.gender,
                                hairColor: newCharacter.hairColor,
                                eyeColor: newCharacter.eyeColor,
                                hairstyle: newCharacter.hairstyle,
                                interests: newCharacter.interests,
                                extraInterestNote: newCharacter.extraInterestNote
                            )
                        )
                    }
                }
            }
            .sheet(item: $editingCharacter) { character in
                CharacterWizardSheet(
                    role: character.role,
                    editing: character,
                    onSave: { updated in
                        Task {
                            await vm.update(
                                character.id,
                                UpdateCharacterRequest(
                                    role: updated.role,
                                    name: updated.name,
                                    symbolName: updated.symbolName,
                                    tint: updated.tintName,
                                    tagline: updated.tagline.isEmpty ? nil : updated.tagline,
                                    age: updated.age,
                                    gender: updated.gender,
                                    hairColor: updated.hairColor,
                                    eyeColor: updated.eyeColor,
                                    hairstyle: updated.hairstyle,
                                    interests: updated.interests,
                                    extraInterestNote: updated.extraInterestNote
                                )
                            )
                        }
                    },
                    onDelete: {
                        selectedCharacterIds.remove(character.id)
                        Task { _ = await vm.delete(character.id) }
                    }
                )
            }
            .task { await vm.load() }
            .alert(
                "Something went wrong",
                isPresented: Binding(
                    get: { vm.errorMessage != nil },
                    set: { if !$0 { vm.errorMessage = nil } }
                ),
                actions: { Button("OK") { vm.errorMessage = nil } },
                message: { Text(vm.errorMessage ?? "") }
            )
            .sheet(isPresented: $showStoryFlow) {
                ModeSheetView(characters: selectedCharacters) { story in
                    // Auto-push the reader for the just-created story unless
                    // the user explicitly cancelled mid-generation. The sheet
                    // dismisses itself; the reader pushes onto Home's stack so
                    // the user can swipe back to Home naturally.
                    navigationPath.append(HomeRoute.story(id: story.id))
                }
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
            }
            .navigationDestination(for: HomeRoute.self) { route in
                switch route {
                case .story(let id):
                    StoryReaderView(storyId: id)
                }
            }
        }
    }
}

/// Typed routes pushed onto HomeView's NavigationStack. Wrapping the story
/// id in an enum keeps the destination type collision-free (a bare String
/// destination would conflict with anything else that wants to push by id).
enum HomeRoute: Hashable {
    case story(id: String)
}

/// Compact "your story is cooking" / "ready to read" banner that lives at
/// the top of HomeView whenever a generation is in flight (or just landed
/// and hasn't been opened yet).
private struct GenerationBanner: View {
    let inFlight: InFlightGeneration
    let onTap: () -> Void
    let onDismiss: () -> Void

    @State private var pulse: Bool = false
    @State private var cueIndex: Int = 0
    private let cueInterval: Double = 1.8

    private var currentCue: GenerationCue? {
        guard !inFlight.cues.isEmpty else { return nil }
        return inFlight.cues[cueIndex % inFlight.cues.count]
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                cueArtwork
                VStack(alignment: .leading, spacing: 3) {
                    Text(headline)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.miloCream)
                        .lineLimit(1)
                    Text(subline)
                        .font(.caption)
                        .foregroundStyle(Color.miloCream.opacity(0.65))
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
                trailingAffordance
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(isReady ? Color.accentColor.opacity(0.10) : Color.miloCream.opacity(0.04))
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(
                        isReady ? Color.accentColor.opacity(0.45) : Color.miloCream.opacity(0.10),
                        lineWidth: isReady ? 1.5 : 1
                    )
            )
            .shadow(color: Color.black.opacity(0.32), radius: 14, x: 0, y: 6)
        }
        .buttonStyle(.plain)
        .task {
            pulse = true
            // Cycle the cue thumbnail every cueInterval, only while still
            // generating — once ready, freeze on the most recent.
            while !Task.isCancelled, !isReady {
                try? await Task.sleep(for: .seconds(cueInterval))
                if Task.isCancelled || isReady { break }
                withAnimation(.easeInOut(duration: 0.45)) {
                    cueIndex += 1
                }
            }
        }
    }

    private var isReady: Bool { inFlight.status.isReady }
    private var didFail: Bool { if case .failed = inFlight.status { return true }; return false }

    private var headline: String {
        if isReady { return "Your story is ready ✨" }
        if didFail { return "Generation hit a snag" }
        return "Crafting \(inFlight.title)…"
    }

    private var subline: String {
        if isReady { return "Tap to read" }
        if case .failed(let msg) = inFlight.status { return msg }
        return currentCue?.label ?? "Picking the perfect words…"
    }

    @ViewBuilder
    private var cueArtwork: some View {
        ZStack {
            Circle()
                .fill(Color.accentColor.opacity(0.22))
                .frame(width: 52, height: 52)
                .blur(radius: 10)
                .opacity(pulse ? 1.0 : 0.55)
                .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true), value: pulse)

            Group {
                if let cue = currentCue, let imageName = cue.imageName {
                    Image(imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 44, height: 44)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .id("artwork-\(cue.id)")
                        .transition(.opacity)
                } else if let cue = currentCue {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(cue.tint.opacity(0.32))
                        Image(systemName: cue.symbolName)
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                    }
                    .frame(width: 44, height: 44)
                    .id("artwork-\(cue.id)")
                    .transition(.opacity)
                } else {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.miloCream.opacity(0.10))
                        .frame(width: 44, height: 44)
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(Color.miloCream.opacity(0.15), lineWidth: 1)
            )
        }
        .frame(width: 52, height: 52)
    }

    @ViewBuilder
    private var trailingAffordance: some View {
        if isReady {
            Image(systemName: "arrow.right.circle.fill")
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(Color.accentColor)
        } else if didFail {
            Button(action: onDismiss) {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 18))
                    .foregroundStyle(Color.miloCream.opacity(0.5))
            }
            .buttonStyle(.plain)
        } else {
            ProgressView()
                .controlSize(.small)
                .tint(Color.miloCream.opacity(0.7))
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
    let onEdit: (Character) -> Void

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(role.sectionTitle)
                .font(.title2.weight(.bold))

            LazyVGrid(columns: columns, spacing: 20) {
                ForEach(characters) { character in
                    CharacterCard(
                        character: character,
                        isSelected: selectedIds.contains(character.id),
                        onTap: { onToggle(character) }
                    )
                    .contextMenu {
                        Button {
                            onEdit(character)
                        } label: {
                            Label("Edit", systemImage: "pencil")
                        }
                    }
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
            VStack(alignment: .leading, spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(Color.miloCream.opacity(0.06))
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .strokeBorder(
                            Color.accentColor.opacity(0.55),
                            style: StrokeStyle(lineWidth: 1.5, dash: [6, 4])
                        )
                    Image(systemName: "plus")
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundStyle(.tint)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)
                .contentShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

                Text(" ")
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
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
                    CharacterIconView(
                        symbolName: character.symbolName,
                        tint: character.tint,
                        cornerRadius: 22,
                        glyphPointSize: 30
                    )
                    .aspectRatio(1, contentMode: .fit)
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
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

                Text(character.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Shimmer placeholder for cold-start loading

private struct CharacterSectionSkeleton: View {
    let role: CharacterRole
    let cardCount: Int = 5

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(role.sectionTitle)
                .font(.title2.weight(.bold))

            LazyVGrid(columns: columns, spacing: 20) {
                ForEach(0..<cardCount, id: \.self) { _ in
                    CharacterCardSkeleton()
                }
            }
        }
        .padding(.horizontal, 20)
    }
}

private struct CharacterCardSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.gray.opacity(0.18))
                .aspectRatio(1, contentMode: .fit)

            RoundedRectangle(cornerRadius: 4, style: .continuous)
                .fill(Color.gray.opacity(0.18))
                .frame(height: 12)
                .padding(.horizontal, 6)
        }
        .shimmering()
    }
}

// (Shimmer modifier lives in Shimmer.swift so MyStoriesView can use it too.)
