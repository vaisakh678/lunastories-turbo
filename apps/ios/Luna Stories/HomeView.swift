//
//  HomeView.swift
//  Luna Stories
//

import SwiftUI

struct HomeView: View {
    @State private var vm = CharactersViewModel()
    @Environment(StoryGenerationManager.self) private var generations
    @Environment(DeepLinkRouter.self) private var deepLinks
    @Environment(LatestStoryViewModel.self) private var unread
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

    private func drainPendingStoryDeepLink() {
        guard let id = deepLinks.pendingStoryId else { return }
        navigationPath.append(HomeRoute.story(id: id))
        deepLinks.pendingStoryId = nil
    }

    private func openUnread(_ story: StoryResponse) {
        navigationPath.append(HomeRoute.story(id: story.id))
        unread.consume(story.id)
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
                        // Local in-flight generation owns the cue carousel
                        // for as long as it's tracked. Once it lands or the
                        // user acknowledges it, the server-driven latest
                        // banner takes over (which is also what restores
                        // state after a force-quit).
                        if let inFlight = generations.inFlight {
                            GenerationBanner(
                                inFlight: inFlight,
                                onTap: { handleBannerTap(inFlight) },
                                onDismiss: { generations.acknowledge() }
                            )
                            .padding(.horizontal, 20)
                            .transition(.move(edge: .top).combined(with: .opacity))
                        } else if let story = unread.story {
                            LatestStoryBanner(
                                story: story,
                                onTap: { openUnread(story) },
                                onDismiss: { unread.dismiss(story.id) }
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
                            action: {
                                // Lazy permission request — first generation
                                // is a natural moment to ask, since the user
                                // is opting into something that needs notifs.
                                PushNotifications.requestPermissionIfNeeded()
                                showStoryFlow = true
                            }
                        )
                        .padding(.horizontal, 24)
                        .padding(.bottom, 36)
                    }
                }
                .ignoresSafeArea(edges: .bottom)
            }
            .navigationTitle("Luna Stories")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    NavigationLink {
                        AccountView()
                    } label: {
                        VStack(alignment: .trailing, spacing: 5) {
                            RoundedRectangle(cornerRadius: 2)
                                .frame(width: 22, height: 2)
                            RoundedRectangle(cornerRadius: 2)
                                .frame(width: 14, height: 2)
                        }
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
            // Cold-launch case: notification tap may have set pendingStoryId
            // BEFORE HomeView mounted, so .onChange never fires. Drain it
            // on first appear too.
            .onAppear {
                drainPendingStoryDeepLink()
                Task { await unread.refresh() }
            }
            // Re-check unread when an in-flight generation lands — that
            // story may now be the latest unread.
            .onChange(of: generations.inFlight?.status.kind) { _, _ in
                Task { await unread.refresh() }
            }
            // Poll while a server-side generation is in flight (e.g. user
            // force-quit during generation and the local manager is no
            // longer tracking it). Stops the moment the banner flips to
            // ready (or null) because the task id changes.
            .task(id: unread.story?.status) {
                guard
                    let status = unread.story?.status,
                    status == .generating || status == .pending
                else { return }
                while !Task.isCancelled {
                    try? await Task.sleep(for: .seconds(5))
                    if Task.isCancelled { return }
                    await unread.refresh()
                }
            }
            // Background tap: HomeView is already up, the click handler
            // writes pendingStoryId, and .onChange picks it up.
            .onChange(of: deepLinks.pendingStoryId) { _, _ in
                drainPendingStoryDeepLink()
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

/// Server-driven home banner that reflects the user's latest actionable
/// story regardless of how it got that way (still generating after a
/// force-quit, ready and waiting to be read, etc.). Dismissable for the
/// session; auto-clears once the user opens it (the reader stamps
/// lastReadAt and the next refresh skips it).
///
/// Three render branches based on status + freshness:
/// - `.pending` / `.generating` → "Crafting your story" + spinner
/// - `.ready` AND created in the last `freshWindowMinutes` → "Your story
///   is ready" with sparkle eyebrow, stronger coral border, and a gentle
///   breathing pulse to draw the eye while the moment is hot
/// - `.ready` after that window → "Pick up where you left off" — calmer
///   nudge, same coral CTA
private struct LatestStoryBanner: View {
    let story: StoryResponse
    let onTap: () -> Void
    let onDismiss: () -> Void

    @State private var pulse: Bool = false

    /// How long after `createdAt` we treat a ready story as "just landed".
    /// Tight enough to feel timely, loose enough to survive a parent
    /// stepping away to brush teeth, take a call, etc.
    private static let freshWindowMinutes: Double = 30

    private var tint: Color {
        ColorPalette.color(for: story.coverTint ?? "blue")
    }

    private var isGenerating: Bool {
        story.status == .generating || story.status == .pending
    }

    private var createdDate: Date? {
        let withFractional = ISO8601DateFormatter()
        withFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return withFractional.date(from: story.createdAt)
            ?? ISO8601DateFormatter().date(from: story.createdAt)
    }

    private var isFresh: Bool {
        guard story.status == .ready, let date = createdDate else { return false }
        return Date.now.timeIntervalSince(date) < Self.freshWindowMinutes * 60
    }

    private var eyebrow: String {
        if isGenerating { return "Crafting your story" }
        if isFresh { return "✨ Your story is ready" }
        return "Pick up where you left off"
    }

    private var titleText: String {
        story.title ?? (isGenerating ? "A new bedtime story…" : "Untitled story")
    }

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(tint.opacity(0.32))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .strokeBorder(Color.miloCream.opacity(0.15), lineWidth: 1)
                        )
                    Image(systemName: story.coverSymbol ?? (isGenerating ? "sparkles" : "book.fill"))
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(Color.miloCream)
                }
                .frame(width: 48, height: 48)

                VStack(alignment: .leading, spacing: 3) {
                    Text(eyebrow)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.miloCream.opacity(isFresh ? 0.85 : 0.7))
                        .textCase(.uppercase)
                        .tracking(0.4)
                    Text(titleText)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.miloCream)
                        .lineLimit(1)
                }
                Spacer(minLength: 0)
                if isGenerating {
                    ProgressView()
                        .controlSize(.small)
                        .tint(Color.miloCream.opacity(0.7))
                } else {
                    Image(systemName: "arrow.right.circle.fill")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundStyle(Color.accentColor)
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(
                                isFresh
                                    ? Color.accentColor.opacity(0.10)
                                    : Color.miloCream.opacity(0.04)
                            )
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(borderColor, lineWidth: isFresh ? 1.5 : 1)
            )
            .shadow(color: shadowColor, radius: isFresh ? 18 : 14, x: 0, y: 6)
            // Gentle breathing pulse only for fresh ready stories — draws
            // the eye without being distracting.
            .scaleEffect(isFresh && pulse ? 1.015 : 1.0)
            .animation(
                isFresh
                    ? .easeInOut(duration: 1.6).repeatForever(autoreverses: true)
                    : .default,
                value: pulse
            )
            .overlay(alignment: .topTrailing) {
                Button(action: onDismiss) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(Color.miloCream.opacity(0.5))
                        .background(Circle().fill(Color.black.opacity(0.4)))
                }
                .buttonStyle(.plain)
                .offset(x: 6, y: -6)
            }
        }
        .buttonStyle(.plain)
        .onAppear { if isFresh { pulse = true } }
    }

    private var borderColor: Color {
        if isGenerating { return Color.miloCream.opacity(0.10) }
        return isFresh ? Color.accentColor.opacity(0.6) : Color.accentColor.opacity(0.35)
    }

    private var shadowColor: Color {
        isFresh
            ? Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.30)
            : Color.black.opacity(0.32)
    }
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

#Preview {
    HomeView()
        .environment(StoryGenerationManager())
        .environment(DeepLinkRouter())
        .environment(LatestStoryViewModel())
        .preferredColorScheme(.dark)
}
