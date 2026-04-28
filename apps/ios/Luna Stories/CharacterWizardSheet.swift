//
//  CharacterWizardSheet.swift
//  Luna Stories
//

import SwiftUI

struct CharacterWizardSheet: View {
    let role: CharacterRole
    var editing: Character? = nil
    let onSave: (Character) -> Void
    var onDelete: (() -> Void)? = nil

    @Environment(\.dismiss) private var dismiss
    @State private var step: WizardStep = .basicInfo
    @State private var draft: CharacterDraft
    @State private var confirmingDelete: Bool = false

    init(
        role: CharacterRole,
        editing: Character? = nil,
        onSave: @escaping (Character) -> Void,
        onDelete: (() -> Void)? = nil,
    ) {
        self.role = role
        self.editing = editing
        self.onSave = onSave
        self.onDelete = onDelete
        _draft = State(initialValue: CharacterDraft(editing: editing))
    }

    private var isEditing: Bool { editing != nil }
    private var navTitle: String {
        isEditing ? "Edit Character" : role.addPromptTitle
    }

    private var canAdvance: Bool {
        switch step {
        case .basicInfo:
            return !draft.name.trimmingCharacters(in: .whitespaces).isEmpty
        case .icon, .appearance, .interests:
            return true
        }
    }

    private var isLastStep: Bool { step == WizardStep.allCases.last }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ProgressBar(currentIndex: step.rawValue, total: WizardStep.allCases.count)
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                    .padding(.bottom, 8)

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text(step.title)
                            .font(.title2.weight(.bold))
                            .padding(.horizontal, 20)
                            .padding(.top, 8)

                        Group {
                            switch step {
                            case .basicInfo: BasicInfoStep(draft: $draft)
                            case .icon: IconStep(draft: $draft)
                            case .appearance: AppearanceStep(draft: $draft)
                            case .interests: InterestsStep(draft: $draft)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 16)
                }

                bottomBar
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
            }
            .background(MoodyTwilightBackground().ignoresSafeArea())
            .scrollContentBackground(.hidden)
            .toolbarBackground(.hidden, for: .navigationBar)
            .navigationTitle(navTitle)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                    }
                    .accessibilityLabel("Close")
                }
                if isEditing, onDelete != nil {
                    ToolbarItem(placement: .primaryAction) {
                        Button(role: .destructive) {
                            confirmingDelete = true
                        } label: {
                            Image(systemName: "trash")
                                .foregroundStyle(.red)
                        }
                        .accessibilityLabel("Delete character")
                    }
                }
            }
            .alert(
                "Delete this character?",
                isPresented: $confirmingDelete
            ) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    onDelete?()
                    dismiss()
                }
            } message: {
                Text("This will permanently delete \(editing?.name ?? "the character"). You can't undo this.")
            }
        }
    }

    private var bottomBar: some View {
        HStack(spacing: 12) {
            if step != WizardStep.allCases.first {
                Button {
                    if let prev = WizardStep(rawValue: step.rawValue - 1) {
                        step = prev
                    }
                } label: {
                    Text("Back")
                        .font(.headline)
                        .foregroundStyle(Color.accentColor)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 16)
                        .background(
                            Capsule().fill(Color.accentColor.opacity(0.12))
                        )
                }
                .buttonStyle(.plain)
            }

            Button {
                if isLastStep {
                    save()
                } else if let next = WizardStep(rawValue: step.rawValue + 1) {
                    step = next
                }
            } label: {
                Text(isLastStep ? "Save" : "Next")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        Capsule().fill(canAdvance ? Color.accentColor : Color.gray.opacity(0.4))
                    )
            }
            .buttonStyle(.plain)
            .disabled(!canAdvance)
        }
    }

    private func save() {
        let trimmedName = draft.name.trimmingCharacters(in: .whitespaces)
        let character = Character(
            id: editing?.id ?? UUID(),
            name: trimmedName,
            role: role,
            symbolName: draft.iconName,
            tintName: editing?.tintName ?? role.defaultTintName,
            tagline: draft.interests.sorted().prefix(2).joined(separator: " · "),
            age: draft.age,
            gender: draft.gender,
            hairColor: draft.hairColor,
            eyeColor: draft.eyeColor,
            hairstyle: draft.hairstyle,
            interests: draft.interests.sorted(),
            extraInterestNote: draft.extraInterestNote.trimmingCharacters(in: .whitespaces)
        )
        onSave(character)
        dismiss()
    }
}

// MARK: - Wizard internals

private struct CharacterDraft {
    var name: String = ""
    var age: Int = 6
    var gender: Gender = .na
    var iconName: String = "person.fill"
    var hairColor: String? = nil
    var eyeColor: String? = nil
    var hairstyle: String? = nil
    var interests: Set<String> = []
    var extraInterestNote: String = ""

    init(editing: Character? = nil) {
        guard let c = editing else { return }
        name = c.name
        age = c.age ?? 6
        gender = c.gender ?? .na
        iconName = c.symbolName
        hairColor = c.hairColor
        eyeColor = c.eyeColor
        hairstyle = c.hairstyle
        interests = Set(c.interests)
        extraInterestNote = c.extraInterestNote
    }
}

private enum WizardStep: Int, CaseIterable {
    case basicInfo
    case icon
    case appearance
    case interests

    var title: String {
        switch self {
        case .basicInfo: "Basic Info"
        case .icon: "Choose an Icon"
        case .appearance: "Appearance"
        case .interests: "Interests"
        }
    }
}

private let iconOptions: [String] = [
    "person.fill", "figure.child", "figure.child.circle.fill",
    "star.fill", "moon.stars.fill", "sparkles",
    "cat.fill", "dog.fill", "bird.fill",
    "tortoise.fill", "fish.fill", "ant.fill",
    "leaf.fill", "flame.fill", "snowflake",
    "sailboat.fill", "airplane", "globe",
]

private let hairColorOptions: [(name: String, color: Color)] = [
    ("Black", .black),
    ("Brown", .brown),
    ("Blonde", .yellow),
    ("Red", .red),
    ("Gray", .gray),
    ("White", .white),
    ("Blue", .blue),
    ("Pink", .pink),
]

private let eyeColorOptions: [(name: String, color: Color)] = [
    ("Brown", .brown),
    ("Blue", .blue),
    ("Green", .green),
    ("Hazel", .orange),
    ("Gray", .gray),
]

private let hairstyleOptions: [String] = [
    "Short", "Long", "Curly", "Straight", "Ponytail", "Braids", "Bald",
]

private let interestOptions: [String] = [
    "Sports", "Music", "Reading", "Art", "Science", "Animals",
    "Dance", "Cooking", "Gaming", "Nature", "Magic", "Space",
]

private struct ProgressBar: View {
    let currentIndex: Int
    let total: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<total, id: \.self) { i in
                Capsule()
                    .fill(i <= currentIndex ? Color.accentColor : Color.gray.opacity(0.25))
                    .frame(height: 4)
            }
        }
    }
}

// MARK: - Step 1: Basic Info

private struct BasicInfoStep: View {
    @Binding var draft: CharacterDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            FieldLabel("Name")
            TextField("e.g. Milo", text: $draft.name)
                .textFieldStyle(.plain)
                .font(.title3)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(Color.miloCream.opacity(0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .strokeBorder(Color.miloCream.opacity(0.18), lineWidth: 1)
                )

            FieldLabel("Age")
            HStack {
                Text("\(draft.age) years")
                    .font(.body)
                Spacer()
                Stepper("", value: $draft.age, in: 1...18)
                    .labelsHidden()
            }

            FieldLabel("Gender")
            Picker("Gender", selection: $draft.gender) {
                ForEach(Gender.allCases) { gender in
                    Text(gender.rawValue).tag(gender)
                }
            }
            .pickerStyle(.segmented)
        }
    }
}

// MARK: - Step 2: Icon

private struct IconStep: View {
    @Binding var draft: CharacterDraft
    @Environment(AvatarsViewModel.self) private var avatars

    private let columns = Array(
        repeating: GridItem(.flexible(), spacing: 12),
        count: 3
    )

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            FieldLabel("Pick an icon")
            if avatars.avatars.isEmpty {
                if avatars.isLoading {
                    ProgressView().padding(.vertical, 16)
                } else {
                    Text("No avatars available yet.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            } else {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(avatars.avatars) { avatar in
                        let isSelected = draft.iconName == avatar.id
                        Button {
                            draft.iconName = avatar.id
                        } label: {
                            CharacterIconView(
                                symbolName: avatar.id,
                                tint: .accentColor,
                                cornerRadius: 22,
                                glyphPointSize: 28
                            )
                            .frame(maxWidth: .infinity)
                            .aspectRatio(1, contentMode: .fit)
                            .overlay(
                                RoundedRectangle(cornerRadius: 22, style: .continuous)
                                    .strokeBorder(
                                        isSelected ? Color.accentColor : Color.clear,
                                        lineWidth: 3
                                    )
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}

// MARK: - Step 3: Appearance

private struct AppearanceStep: View {
    @Binding var draft: CharacterDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            VStack(alignment: .leading, spacing: 10) {
                FieldLabel("Hair color")
                ColorChipRow(
                    options: hairColorOptions,
                    selectedName: $draft.hairColor
                )
            }

            VStack(alignment: .leading, spacing: 10) {
                FieldLabel("Eye color")
                ColorChipRow(
                    options: eyeColorOptions,
                    selectedName: $draft.eyeColor
                )
            }

            VStack(alignment: .leading, spacing: 10) {
                FieldLabel("Hairstyle")
                ChipFlow(
                    options: hairstyleOptions,
                    isSelected: { draft.hairstyle == $0 },
                    onTap: { option in
                        draft.hairstyle = (draft.hairstyle == option) ? nil : option
                    }
                )
            }
        }
    }
}

private struct ColorChipRow: View {
    let options: [(name: String, color: Color)]
    @Binding var selectedName: String?

    private let columns = [GridItem(.adaptive(minimum: 60), spacing: 12)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(options, id: \.name) { option in
                let isSelected = selectedName == option.name
                Button {
                    selectedName = isSelected ? nil : option.name
                } label: {
                    VStack(spacing: 6) {
                        Circle()
                            .fill(option.color)
                            .frame(width: 44, height: 44)
                            .overlay(
                                Circle()
                                    .strokeBorder(
                                        isSelected ? Color.accentColor : Color.gray.opacity(0.3),
                                        lineWidth: isSelected ? 3 : 1
                                    )
                            )
                        Text(option.name)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Step 4: Interests

private struct InterestsStep: View {
    @Binding var draft: CharacterDraft

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            FieldLabel("Pick interests")
            ChipFlow(
                options: interestOptions,
                isSelected: { draft.interests.contains($0) },
                onTap: { option in
                    if draft.interests.contains(option) {
                        draft.interests.remove(option)
                    } else {
                        draft.interests.insert(option)
                    }
                }
            )

            FieldLabel("Tell us more")
            TextField("Anything else? e.g. loves dinosaurs", text: $draft.extraInterestNote, axis: .vertical)
                .textFieldStyle(.plain)
                .font(.body)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .frame(minHeight: 140, alignment: .topLeading)
                .lineLimit(6...10)
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(Color.miloCream.opacity(0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .strokeBorder(Color.miloCream.opacity(0.18), lineWidth: 1)
                )
        }
    }
}

// MARK: - Shared chip components

private struct FieldLabel: View {
    let text: String
    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
    }
}

private struct ChipFlow: View {
    let options: [String]
    let isSelected: (String) -> Bool
    let onTap: (String) -> Void

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(options, id: \.self) { option in
                let selected = isSelected(option)
                Button {
                    onTap(option)
                } label: {
                    Text(option)
                        .font(.subheadline.weight(.medium))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .fill(selected ? Color.accentColor : Color.accentColor.opacity(0.12))
                        )
                        .foregroundStyle(selected ? Color.white : Color.accentColor)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

private struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var totalWidth: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                y += rowHeight + spacing
                x = 0
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
            totalWidth = max(totalWidth, x)
        }

        return CGSize(width: maxWidth.isFinite ? maxWidth : totalWidth, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x: CGFloat = bounds.minX
        var y: CGFloat = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX {
                y += rowHeight + spacing
                x = bounds.minX
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), anchor: .topLeading, proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
