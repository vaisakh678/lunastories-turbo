//
//  OnboardingCarouselView.swift
//  Milo Tales
//

import SwiftUI

struct OnboardingCarouselView: View {
    let onFinish: () -> Void

    @State private var page: Int = 0

    private let slides: [OnboardingSlide] = [
        OnboardingSlide(
            symbol: "person.2.fill",
            tint: .purple,
            title: "Characters that look like your kid",
            subtitle: "Pick their hair, eyes, and hobbies. Every story stars someone they recognize."
        ),
        OnboardingSlide(
            symbol: "books.vertical.fill",
            tint: .orange,
            title: "Choose a theme, spark a tale",
            subtitle: "Inventors, jungle adventures, vegetables, classics — nine modes to mix and match."
        ),
        OnboardingSlide(
            symbol: "moon.stars.fill",
            tint: .blue,
            title: "Listen together at bedtime",
            subtitle: "Each story comes with gentle narration to wind your little one down for sleep."
        ),
    ]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.purple.opacity(0.15), Color.blue.opacity(0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        onFinish()
                    } label: {
                        Text("Skip")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                    .padding(.trailing, 20)
                    .padding(.top, 12)
                }

                TabView(selection: $page) {
                    ForEach(slides.indices, id: \.self) { i in
                        SlideView(slide: slides[i])
                            .tag(i)
                    }
                }
                #if os(iOS)
                .tabViewStyle(.page(indexDisplayMode: .never))
                #endif

                HStack(spacing: 8) {
                    ForEach(slides.indices, id: \.self) { i in
                        Capsule()
                            .fill(
                                i == page
                                    ? Color.accentColor
                                    : Color.gray.opacity(0.3)
                            )
                            .frame(
                                width: i == page ? 22 : 8,
                                height: 8
                            )
                            .animation(.easeInOut(duration: 0.2), value: page)
                    }
                }
                .padding(.bottom, 24)

                Button {
                    if page < slides.count - 1 {
                        withAnimation { page += 1 }
                    } else {
                        onFinish()
                    }
                } label: {
                    Text(page < slides.count - 1 ? "Next" : "Get Started")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Capsule().fill(Color.accentColor))
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 24)
                .padding(.bottom, 28)
            }
        }
        .navigationBarBackButtonHidden(true)
        #if os(iOS)
        .toolbar(.hidden, for: .navigationBar)
        #endif
    }
}

private struct OnboardingSlide: Hashable {
    let symbol: String
    let tint: Color
    let title: String
    let subtitle: String
}

private struct SlideView: View {
    let slide: OnboardingSlide

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                Circle()
                    .fill(slide.tint.opacity(0.18))
                    .frame(width: 200, height: 200)
                Image(systemName: slide.symbol)
                    .font(.system(size: 84, weight: .semibold))
                    .foregroundStyle(slide.tint)
            }

            VStack(spacing: 12) {
                Text(slide.title)
                    .font(.system(size: 28, weight: .bold))
                    .multilineTextAlignment(.center)
                Text(slide.subtitle)
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(.horizontal, 32)

            Spacer()
        }
    }
}
