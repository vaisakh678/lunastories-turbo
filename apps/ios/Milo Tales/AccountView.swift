//
//  AccountView.swift
//  Milo Tales
//

import SwiftUI

struct AccountView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Circle()
                        .fill(Color.accentColor.opacity(0.18))
                        .frame(width: 96, height: 96)
                        .overlay(
                            Image(systemName: "person.fill")
                                .font(.system(size: 40, weight: .semibold))
                                .foregroundStyle(.tint)
                        )
                    VStack(spacing: 2) {
                        Text("Hello, Storyteller")
                            .font(.title3.weight(.semibold))
                        Text("Manage your profile")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.top, 12)

                VStack(spacing: 0) {
                    NavigationLink {
                        MyStoriesView()
                    } label: {
                        MenuRowLabel(icon: "book.fill", title: "My Stories")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "star.circle.fill", title: "Subscribe")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "gearshape.fill", title: "Settings")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "gift.fill", title: "Share and Earn")
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 60)
                    Button {} label: {
                        MenuRowLabel(icon: "bubble.left.fill", title: "Send Feedback")
                    }
                    .buttonStyle(.plain)
                }
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)

                Button {} label: {
                    MenuRowLabel(
                        icon: "rectangle.portrait.and.arrow.right",
                        title: "Logout",
                        tint: .red
                    )
                }
                .buttonStyle(.plain)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 20)
        }
        .background(Color.gray.opacity(0.08))
    }
}

private struct MenuRowLabel: View {
    let icon: String
    let title: String
    var tint: Color = .primary

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(tint == .primary ? Color.accentColor : tint)
                .frame(width: 24)
            Text(title)
                .font(.body)
                .foregroundStyle(tint)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.footnote)
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .contentShape(Rectangle())
    }
}
