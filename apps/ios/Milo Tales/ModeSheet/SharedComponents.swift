//
//  SharedComponents.swift
//  Milo Tales
//

import SwiftUI

struct PickOption: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let symbolName: String
    let tint: Color
    /// Optional asset image name. When set, the tile renders the artwork
    /// (cropped to a square) instead of the tinted SF symbol.
    var imageName: String? = nil

    /// Convert a picked option into a generation-loading cue, preserving the
    /// artwork (when present) or falling back to the symbol+tint combo.
    func asCue() -> GenerationCue {
        GenerationCue(
            id: "pick-\(id.uuidString)",
            label: title,
            imageName: imageName,
            symbolName: symbolName,
            tint: tint
        )
    }
}

extension View {
    /// Renders an inline toolbar title that fades in based on a binding.
    /// Pair with `.onScrollVisibilityChange` on the in-content header so the
    /// title only appears once the large header has scrolled out of view.
    func scrollAwareToolbarTitle(_ title: String, isShowing: Bool) -> some View {
        toolbar {
            ToolbarItem(placement: .principal) {
                Text(title)
                    .font(.headline)
                    .opacity(isShowing ? 1 : 0)
                    .animation(.easeInOut(duration: 0.2), value: isShowing)
            }
        }
    }

    func modeStepChrome(isRoot: Bool, onClose: @escaping () -> Void) -> some View {
        modifier(ModeStepChromeModifier(isRoot: isRoot, onClose: onClose))
    }
}

private struct ModeStepChromeModifier: ViewModifier {
    let isRoot: Bool
    let onClose: () -> Void

    @Environment(\.dismiss) private var dismiss

    func body(content: Content) -> some View {
        content
            .background(MoodyTwilightBackground().ignoresSafeArea())
            .navigationBarBackButtonHidden(true)
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        if isRoot {
                            onClose()
                        } else {
                            dismiss()
                        }
                    } label: {
                        Image(systemName: isRoot ? "xmark" : "chevron.left")
                    }
                    .accessibilityLabel(isRoot ? "Close" : "Back")
                }
                if !isRoot {
                    ToolbarItem(placement: .primaryAction) {
                        Button(action: onClose) {
                            Image(systemName: "xmark")
                        }
                        .accessibilityLabel("Close")
                    }
                }
            }
    }
}

/// Twilight aurora background — deep violet base with warm coral and gold
/// glows in the corners, echoing the lantern-lit dusk of the story icons.
struct MoodyTwilightBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.10, green: 0.07, blue: 0.25),
                    Color(red: 0.16, green: 0.10, blue: 0.36),
                    Color(red: 0.06, green: 0.04, blue: 0.16),
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            RadialGradient(
                colors: [Color(red: 0.96, green: 0.73, blue: 0.26).opacity(0.32), .clear],
                center: UnitPoint(x: 0.85, y: 0.05),
                startRadius: 0,
                endRadius: 380
            )

            RadialGradient(
                colors: [Color(red: 0.91, green: 0.35, blue: 0.24).opacity(0.30), .clear],
                center: UnitPoint(x: 0.05, y: 0.32),
                startRadius: 0,
                endRadius: 360
            )

            RadialGradient(
                colors: [Color(red: 0.42, green: 0.29, blue: 0.64).opacity(0.35), .clear],
                center: UnitPoint(x: 0.5, y: 1.05),
                startRadius: 0,
                endRadius: 460
            )
        }
    }
}

extension Color {
    static let miloCream = Color(red: 1.0, green: 0.97, blue: 0.93)
    /// Warm off-white "page" surface used for long-form prose in the
    /// story reader. Slightly darker than miloCream so it doesn't glare
    /// against the moody twilight backdrop.
    static let miloPaper = Color(red: 0.98, green: 0.95, blue: 0.89)
    /// Deep slate-violet text color for prose on the cream page surface.
    /// Warm-toned so it sits with the brand palette rather than feeling
    /// like cold black ink.
    static let miloInk = Color(red: 0.16, green: 0.12, blue: 0.22)
}

struct CharacterStepHeader: View {
    let character: Character
    let title: String
    var stepLabel: String? = nil

    var body: some View {
        VStack(spacing: 10) {
            if let stepLabel {
                StepBadge(text: stepLabel)
            }
            CharacterIconView(
                symbolName: character.symbolName,
                tint: character.tint,
                cornerRadius: 32,
                glyphPointSize: 28
            )
            .frame(width: 64, height: 64)
            Text(character.name)
                .font(.title3.weight(.semibold))
                .foregroundStyle(Color.miloCream)
            Text(title)
                .font(.subheadline)
                .foregroundStyle(Color.miloCream.opacity(0.65))
        }
    }
}

/// Tiny pill that announces "Step X of Y" so users know where they are in
/// multi-step mode flows (mainly for Creative which can run up to 7 steps
/// with multiple characters).
struct StepBadge: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(Color.accentColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(Capsule().fill(Color.accentColor.opacity(0.12)))
    }
}

struct PlainStepHeader: View {
    let title: String
    var subtitle: String? = nil
    var stepLabel: String? = nil

    var body: some View {
        VStack(spacing: 6) {
            if let stepLabel {
                StepBadge(text: stepLabel)
                    .padding(.bottom, 6)
            }
            Text(title)
                .font(.title2.weight(.bold))
                .foregroundStyle(Color.miloCream)
                .multilineTextAlignment(.center)
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(Color.miloCream.opacity(0.65))
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 20)
    }
}

struct OptionGrid: View {
    let options: [PickOption]
    var allowSurprise: Bool = true
    /// When set, an "Other…" tile is appended that calls this closure (typically
    /// to open a custom text-input sheet). Lets users go off-script without
    /// losing the speed of tile selection for the common case.
    var onOther: (() -> Void)? = nil
    let onSelect: (PickOption) -> Void

    private let columns = [
        GridItem(.flexible(), spacing: 20),
        GridItem(.flexible(), spacing: 20),
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 20) {
            if allowSurprise, !options.isEmpty {
                SurpriseTile {
                    if let pick = options.randomElement() { onSelect(pick) }
                }
            }
            ForEach(options) { option in
                OptionTile(option: option) { onSelect(option) }
            }
            if let onOther {
                OtherTile(action: onOther)
            }
        }
    }
}

/// "Other…" tile. Opens a custom text-entry sheet so users aren't locked
/// into the predefined options. Styled as an outlined dashed tile so it
/// reads as "the escape hatch" rather than another regular pick.
private struct OtherTile: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .strokeBorder(
                            Color.miloCream.opacity(0.35),
                            style: StrokeStyle(lineWidth: 2, dash: [6])
                        )
                    Image(systemName: "pencil")
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundStyle(Color.miloCream.opacity(0.7))
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)

                Text("Other…")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.miloCream)
                    .multilineTextAlignment(.center)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity)
            }
        }
        .buttonStyle(.plain)
    }
}

/// Compact sheet that captures a free-text "place" (or any custom string)
/// from the user. Designed to be presented from the placeStep's `onOther`
/// hook so the standard tile flow stays one-tap fast.
struct CustomTextSheet: View {
    let title: String
    let prompt: String
    let placeholder: String
    let continueLabel: String
    @Binding var text: String
    let onContinue: (String) -> Void

    @Environment(\.dismiss) private var dismiss
    @FocusState private var focused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                VStack(spacing: 8) {
                    Text(title)
                        .font(.title3.weight(.bold))
                    Text(prompt)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 12)

                TextField(placeholder, text: $text, axis: .vertical)
                    .lineLimit(1...3)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.gray.opacity(0.12))
                    )
                    .focused($focused)
                    .submitLabel(.go)
                    .onSubmit { submit() }

                Button(action: submit) {
                    Text(continueLabel)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            Capsule().fill(canSubmit ? Color.accentColor : Color.gray.opacity(0.4))
                        )
                }
                .buttonStyle(.plain)
                .disabled(!canSubmit)

                Spacer()
            }
            .padding(.horizontal, 20)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .onAppear { focused = true }
        }
        .presentationDetents([.medium])
    }

    private var canSubmit: Bool {
        !text.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func submit() {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        onContinue(trimmed)
    }
}

/// Square tile that picks a random option for the user. Same shape as the
/// regular grid tiles so it slots in naturally as the first item.
private struct SurpriseTile: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Color.accentColor, Color.accentColor.opacity(0.7)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                    Image(systemName: "dice.fill")
                        .font(.system(size: 36, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)

                Text("Surprise me")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.miloCream)
                    .multilineTextAlignment(.center)
                    .lineLimit(1)
                    .frame(maxWidth: .infinity)
            }
        }
        .buttonStyle(.plain)
    }
}

struct OptionTile: View {
    let option: PickOption
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                if let imageName = option.imageName {
                    Color.clear
                        .aspectRatio(1, contentMode: .fit)
                        .overlay(
                            Image(imageName)
                                .resizable()
                                .scaledToFill()
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                } else {
                    ZStack {
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .fill(option.tint.opacity(0.32))
                            .overlay(
                                RoundedRectangle(cornerRadius: 22, style: .continuous)
                                    .strokeBorder(Color.white.opacity(0.08), lineWidth: 1)
                            )
                        Image(systemName: option.symbolName)
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(Color.miloCream)
                    }
                    .frame(maxWidth: .infinity)
                    .aspectRatio(1, contentMode: .fit)
                }

                Text(option.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.miloCream)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity)
            }
        }
        .buttonStyle(.plain)
    }
}

struct OptionList: View {
    let options: [PickOption]
    var allowSurprise: Bool = true
    var onOther: (() -> Void)? = nil
    let onSelect: (PickOption) -> Void

    var body: some View {
        LazyVStack(spacing: 8) {
            if allowSurprise, !options.isEmpty {
                SurpriseRow {
                    if let pick = options.randomElement() { onSelect(pick) }
                }
            }
            ForEach(options) { option in
                OptionRow(option: option) { onSelect(option) }
            }
            if let onOther {
                OtherRow(action: onOther)
            }
        }
    }
}

private struct OtherRow: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(
                            Color.secondary.opacity(0.4),
                            style: StrokeStyle(lineWidth: 2, dash: [6])
                        )
                        .frame(width: 44, height: 44)
                    Image(systemName: "pencil")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                Text("Other…")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer(minLength: 8)
                Image(systemName: "chevron.right")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.gray.opacity(0.06))
            )
        }
        .buttonStyle(.plain)
    }
}

private struct SurpriseRow: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [Color.accentColor, Color.accentColor.opacity(0.7)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 44, height: 44)
                    Image(systemName: "dice.fill")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(.white)
                }
                Text("Surprise me")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Spacer(minLength: 8)
                Image(systemName: "chevron.right")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.accentColor.opacity(0.10))
            )
        }
        .buttonStyle(.plain)
    }
}

struct OptionRow: View {
    let option: PickOption
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(option.tint.opacity(0.18))
                        .frame(width: 44, height: 44)
                    Image(systemName: option.symbolName)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(option.tint)
                }
                Text(option.title)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 8)
                Image(systemName: "chevron.right")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.gray.opacity(0.08))
            )
        }
        .buttonStyle(.plain)
    }
}

struct PlaceTextInput: View {
    @Binding var text: String
    let placeholder: String
    let isLastStep: Bool
    let onSubmit: () -> Void

    private var canSubmit: Bool {
        !text.trimmingCharacters(in: .whitespaces).isEmpty
    }

    var body: some View {
        VStack(spacing: 16) {
            TextField(placeholder, text: $text, axis: .vertical)
                .font(.body)
                .padding(.horizontal, 14)
                .padding(.vertical, 14)
                .lineLimit(2...5)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.gray.opacity(0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.gray.opacity(0.25), lineWidth: 1.5)
                )

            Button(action: onSubmit) {
                Text(isLastStep ? "Done" : "Continue")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(
                        Capsule().fill(canSubmit ? Color.accentColor : Color.gray.opacity(0.4))
                    )
            }
            .buttonStyle(.plain)
            .disabled(!canSubmit)
        }
    }
}
