//
//  ToastCenter.swift
//  Luna Stories
//
//  App-scoped, lightweight toast notifications. Inject `ToastCenter` into the
//  environment and render `ToastOverlay()` once at the app root; anywhere can
//  then call `toast.show("…")`. Used e.g. when story generation is rejected
//  (quota reached) — the modal closes and the message surfaces here.
//

import Observation
import SwiftUI

enum ToastStyle: Equatable {
    case error
    case info
    case success

    var icon: String {
        switch self {
        case .error: "exclamationmark.triangle.fill"
        case .info: "info.circle.fill"
        case .success: "checkmark.circle.fill"
        }
    }

    var tint: Color {
        switch self {
        case .error: Color(red: 0.95, green: 0.49, blue: 0.34) // warm coral
        case .info: .accentColor
        case .success: Color(red: 0.40, green: 0.78, blue: 0.55)
        }
    }
}

struct Toast: Identifiable, Equatable {
    let id = UUID()
    let message: String
    let style: ToastStyle
}

@Observable
@MainActor
final class ToastCenter {
    private(set) var current: Toast?
    private var dismissTask: Task<Void, Never>?

    /// Show a toast, auto-dismissing after `duration` seconds. A new toast
    /// replaces any current one (and resets the timer).
    func show(_ message: String, style: ToastStyle = .error, duration: Double = 3) {
        current = Toast(message: message, style: style)
        dismissTask?.cancel()
        dismissTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(duration))
            guard !Task.isCancelled else { return }
            self?.current = nil
        }
    }

    func dismiss() {
        dismissTask?.cancel()
        current = nil
    }
}

/// Renders the current toast pinned to the top of the screen. Place once at
/// the app root (e.g. in an `.overlay(alignment: .top)`). Only the card itself
/// captures touches, so it never blocks the UI underneath when idle.
struct ToastOverlay: View {
    @Environment(ToastCenter.self) private var toast

    var body: some View {
        if let current = toast.current {
            ToastCard(toast: current) { toast.dismiss() }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .transition(.move(edge: .top).combined(with: .opacity))
                .animation(.spring(response: 0.4, dampingFraction: 0.85), value: toast.current)
        }
    }
}

private struct ToastCard: View {
    let toast: Toast
    let onDismiss: () -> Void

    @State private var dragOffset: CGFloat = 0

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: toast.style.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(toast.style.tint)

            Text(toast.message)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Color.miloCream)
                .fixedSize(horizontal: false, vertical: true)

            Spacer(minLength: 8)

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color.miloCream.opacity(0.6))
                    .padding(6)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Dismiss")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .strokeBorder(toast.style.tint.opacity(0.45), lineWidth: 1)
                )
        )
        .shadow(color: Color.black.opacity(0.35), radius: 16, x: 0, y: 8)
        .offset(y: dragOffset)
        // Swipe up to dismiss; other directions snap back.
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = min(0, value.translation.height)
                }
                .onEnded { value in
                    if value.translation.height < -40 {
                        onDismiss()
                    } else {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                            dragOffset = 0
                        }
                    }
                }
        )
    }
}
