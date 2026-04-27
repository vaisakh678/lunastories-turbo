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
            imageName: "onboarding_1",
            title: "Create your own story",
            subtitle: "Never get bored of the same old tales — create your own unique story with your child."
        ),
        OnboardingSlide(
            imageName: "onboarding_2",
            title: "Choose different characters and professions",
            subtitle: "Your kid can be dragons, unicorns, superheroes, pirates, astronauts — endless options!"
        ),
        OnboardingSlide(
            imageName: "onboarding_3",
            title: "Include family, friends, and pets",
            subtitle: "Make every story personal and special."
        ),
        OnboardingSlide(
            imageName: "onboarding_4",
            title: "Set up your kid's profile",
            subtitle: "To start generating stories, set up your kid's profile first."
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
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Skip") { onFinish() }
                    .foregroundStyle(.secondary)
            }
        }
    }
}

private struct OnboardingSlide: Hashable {
    let imageName: String
    let title: String
    let subtitle: String
}

private struct SlideView: View {
    let slide: OnboardingSlide

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(slide.imageName)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 240, height: 240)
                .clipShape(Circle())

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
