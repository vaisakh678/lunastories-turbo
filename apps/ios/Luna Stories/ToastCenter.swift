//
//  ToastCenter.swift
//  Luna Stories
//
//  App-scoped, lightweight toast notifications. Inject `ToastCenter` into the
//  environment and render `ToastOverlay()` once at the app root; anywhere can
//  then call `toast.show(...)`. Two shapes:
//   - compact error (e.g. generation rejected / quota hit)
//   - a larger card with a title + progress bar (e.g. "running low" at >=80%)
//

import Observation
import SwiftUI

enum ToastStyle: Equatable {
    case error
    case warning
    case info
    case success

    var icon: String {
        switch self {
        case .error: "exclamationmark.triangle.fill"
        case .warning: "exclamationmark.circle.fill"
        case .info: "info.circle.fill"
        case .success: "checkmark.circle.fill"
        }
    }

    var tint: Color {
        switch self {
        case .error: Color(red: 0.95, green: 0.49, blue: 0.34) // warm coral
        case .warning: Color(red: 0.96, green: 0.73, blue: 0.26) // gold
        case .info: .accentColor
        case .success: Color(red: 0.40, green: 0.78, blue: 0.55)
        }
    }
}

struct Toast: Identifiable, Equatable {
    let id = UUID()
    let title: String?
    let message: String
    let style: ToastStyle
    /// Optional progress bar value, 0...1 — drives the "running low" card.
    let progress: Double?
}

@Observable
@MainActor
final class ToastCenter {
    private(set) var current: Toast?
    private var dismissTask: Task<Void, Never>?

    /// Show a toast, auto-dismissing after `duration` seconds. A new toast
    /// replaces any current one (and resets the timer).
    func show(
        _ message: String,
        title: String? = nil,
        style: ToastStyle = .error,
        progress: Double? = nil,
        duration: Double = 3,
    ) {
        current = Toast(title: title, message: message, style: style, progress: progress)
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
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: toast.style.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(toast.style.tint)

            VStack(alignment: .leading, spacing: 6) {
                if let title = toast.title {
                    Text(title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(Color.miloCream)
                }
                Text(toast.message)
                    .font(.subheadline.weight(toast.title == nil ? .medium : .regular))
                    .foregroundStyle(Color.miloCream.opacity(toast.title == nil ? 1 : 0.75))
                    .fixedSize(horizontal: false, vertical: true)

                if let progress = toast.progress {
                    ProgressBar(value: progress, tint: toast.style.tint)
                        .frame(height: 6)
                        .padding(.top, 2)
                }
            }

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

private struct ProgressBar: View {
    let value: Double // 0...1
    let tint: Color

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.miloCream.opacity(0.15))
                Capsule()
                    .fill(tint)
                    .frame(width: geo.size.width * min(max(value, 0), 1))
            }
        }
    }
}
