//
//  AliceInWonderlandModeView.swift
//  Milo Tales
//

import SwiftUI

struct AliceInWonderlandModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let characterOptions: [PickOption] = [
        .init(title: "Alice",            symbolName: "figure.child",        tint: .blue,   imageName: "alice"),
        .init(title: "Mad Hatter",       symbolName: "cup.and.saucer.fill", tint: .green,  imageName: "mad_hatter"),
        .init(title: "Queen of Hearts",  symbolName: "heart.fill",          tint: .red,    imageName: "queen_of_hearts"),
        .init(title: "Cheshire Cat",     symbolName: "cat.fill",            tint: .purple, imageName: "cheshire_cat"),
        .init(title: "The White Rabbit", symbolName: "hare.fill",           tint: .gray,   imageName: "the_white_rabbit"),
        .init(title: "Caterpillar",      symbolName: "ant.fill",            tint: .green,  imageName: "caterpillar"),
    ]

    var body: some View {
        characterPickStep
            .navigationDestination(for: Step.self) { step in
                switch step {
                case .place: placeStep
                }
            }
    }

    private var characterPickStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Pick a character", subtitle: "Who joins the story?")
                    .padding(.bottom, 16)
                OptionGrid(options: characterOptions) { handlePick($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
    }

    private var placeStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                    .padding(.bottom, 16)
                PlaceTextInput(
                    text: $place,
                    placeholder: "e.g. down the rabbit hole",
                    isLastStep: true,
                    onSubmit: handleSubmitPlace
                )
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
    }

    private func handlePick(_ option: PickOption) {
        picked = option
        path.append(Step.place)
    }

    private func handleSubmitPlace() {
        guard !place.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        onComplete(
            StoryInputPayload(
                modeKey: "alice_in_wonderland",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(place.trimmingCharacters(in: .whitespaces)),
                ])
            )
        )
    }
}
