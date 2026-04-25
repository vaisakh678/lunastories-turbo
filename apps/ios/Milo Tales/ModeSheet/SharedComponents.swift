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
}

struct ModeTopBar: View {
    let onClose: () -> Void
    let onBack: (() -> Void)?

    var body: some View {
        HStack {
            Button(action: onClose) {
                Image(systemName: "xmark")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.primary)
                    .frame(width: 32, height: 32)
                    .glassEffect(in: Circle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Close")

            Spacer()

            if let onBack {
                Button(action: onBack) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.primary)
                        .frame(width: 32, height: 32)
                        .glassEffect(in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Back")
            }
        }
    }
}

struct ProgressDots: View {
    let currentIndex: Int
    let total: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<max(total, 1), id: \.self) { i in
                Capsule()
                    .fill(i <= currentIndex ? Color.accentColor : Color.gray.opacity(0.25))
                    .frame(height: 4)
            }
        }
    }
}

struct CharacterStepHeader: View {
    let character: Character
    let title: String

    var body: some View {
        VStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(character.tint.opacity(0.18))
                    .frame(width: 64, height: 64)
                Image(systemName: character.symbolName)
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(character.tint)
            }
            Text(character.name)
                .font(.title3.weight(.semibold))
            Text(title)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}

struct PlainStepHeader: View {
    let title: String
    var subtitle: String? = nil

    var body: some View {
        VStack(spacing: 6) {
            Text(title)
                .font(.title2.weight(.bold))
                .multilineTextAlignment(.center)
            if let subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.horizontal, 20)
    }
}

struct OptionGrid: View {
    let options: [PickOption]
    let onSelect: (PickOption) -> Void

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        LazyVGrid(columns: columns, spacing: 12) {
            ForEach(options) { option in
                OptionTile(option: option) { onSelect(option) }
            }
        }
    }
}

struct OptionTile: View {
    let option: PickOption
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                ZStack {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(option.tint.opacity(0.18))
                    Image(systemName: option.symbolName)
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(option.tint)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1, contentMode: .fit)

                Text(option.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.primary)
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
    let onSelect: (PickOption) -> Void

    var body: some View {
        LazyVStack(spacing: 8) {
            ForEach(options) { option in
                OptionRow(option: option) { onSelect(option) }
            }
        }
    }
}

struct OptionRow: View {
    let option: PickOption
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
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
