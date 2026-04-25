//
//  FeedbackView.swift
//  Milo Tales
//

import SwiftUI

struct FeedbackView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var category: FeedbackCategory = .idea
    @State private var message: String = ""
    @State private var rating: Int = 0
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String?
    @State private var didSubmit: Bool = false

    private var trimmedMessage: String {
        message.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var canSubmit: Bool {
        !isSubmitting && !trimmedMessage.isEmpty
    }

    var body: some View {
        Group {
            if didSubmit {
                successView
            } else {
                formView
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.gray.opacity(0.08))
        .navigationTitle("Send Feedback")
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .alert(
            "Couldn't send feedback",
            isPresented: Binding(
                get: { errorMessage != nil },
                set: { if !$0 { errorMessage = nil } }
            ),
            actions: { Button("OK") { errorMessage = nil } },
            message: { Text(errorMessage ?? "") }
        )
    }

    private var formView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel("What's this about?")
                    HStack(spacing: 8) {
                        ForEach(FeedbackCategory.allCases) { c in
                            CategoryChip(
                                category: c,
                                isSelected: category == c,
                                action: { category = c }
                            )
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel("Your feedback")
                    TextField(
                        "Tell us what's on your mind…",
                        text: $message,
                        axis: .vertical
                    )
                    .textFieldStyle(.plain)
                    .font(.body)
                    .padding(14)
                    .frame(minHeight: 160, alignment: .topLeading)
                    .lineLimit(6...12)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.white)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(Color.gray.opacity(0.2), lineWidth: 1)
                    )
                }

                VStack(alignment: .leading, spacing: 10) {
                    SectionLabel("Rate your experience (optional)")
                    HStack(spacing: 12) {
                        ForEach(1...5, id: \.self) { i in
                            Button {
                                rating = (rating == i) ? 0 : i
                            } label: {
                                Image(systemName: i <= rating ? "star.fill" : "star")
                                    .font(.title2)
                                    .foregroundStyle(
                                        i <= rating ? Color.yellow : Color.gray.opacity(0.4)
                                    )
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("\(i) star\(i == 1 ? "" : "s")")
                        }
                    }
                }

                Button {
                    Task { await submit() }
                } label: {
                    HStack(spacing: 10) {
                        if isSubmitting {
                            ProgressView()
                                .controlSize(.small)
                                .tint(.white)
                        }
                        Text(isSubmitting ? "Sending…" : "Send Feedback")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        Capsule().fill(
                            canSubmit ? Color.accentColor : Color.gray.opacity(0.4)
                        )
                    )
                }
                .buttonStyle(.plain)
                .disabled(!canSubmit)
            }
            .padding(20)
        }
    }

    private var successView: some View {
        VStack(spacing: 20) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.18))
                    .frame(width: 140, height: 140)
                Image(systemName: "checkmark")
                    .font(.system(size: 60, weight: .semibold))
                    .foregroundStyle(.green)
            }

            VStack(spacing: 10) {
                Text("Thanks for the note!")
                    .font(.title2.weight(.bold))
                Text("We read every message — your feedback helps make Milo Tales better.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }

            Spacer()

            Button {
                dismiss()
            } label: {
                Text("Done")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Capsule().fill(Color.accentColor))
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
    }

    private func submit() async {
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            _ = try await FeedbackAPI.send(
                CreateFeedbackRequest(
                    category: category,
                    message: trimmedMessage,
                    rating: rating > 0 ? rating : nil
                )
            )
            didSubmit = true
        } catch {
            errorMessage = (error as? APIError)?.errorDescription
                ?? error.localizedDescription
        }
    }
}

private struct SectionLabel: View {
    let text: String
    init(_ text: String) { self.text = text }

    var body: some View {
        Text(text)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
    }
}

private struct CategoryChip: View {
    let category: FeedbackCategory
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: category.symbol)
                    .font(.caption.weight(.semibold))
                Text(category.label)
                    .font(.subheadline.weight(.medium))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(
                Capsule()
                    .fill(isSelected ? Color.accentColor : Color.accentColor.opacity(0.12))
            )
            .foregroundStyle(isSelected ? Color.white : Color.accentColor)
        }
        .buttonStyle(.plain)
    }
}
