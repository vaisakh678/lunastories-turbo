//
//  WizardOfOzModeView.swift
//  Milo Tales
//

import SwiftUI

struct WizardOfOzModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let characterOptions: [PickOption] = [
        .init(title: "Dorothy",        symbolName: "figure.child",   tint: .blue,   imageName: "dorothy"),
        .init(title: "Toto",           symbolName: "dog.fill",       tint: .gray,   imageName: "toto"),
        .init(title: "Scarecrow",      symbolName: "leaf.fill",      tint: .yellow, imageName: "scarecrow"),
        .init(title: "Tin Man",        symbolName: "gearshape.fill", tint: .gray,   imageName: "tin_man"),
        .init(title: "Cowardly Lion",  symbolName: "pawprint.fill",  tint: .yellow, imageName: "cowardly_lion"),
        .init(title: "Glinda",         symbolName: "wand.and.stars", tint: .pink,   imageName: "glinda"),
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
                    placeholder: "e.g. the Yellow Brick Road",
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
                modeKey: "wizard_of_oz",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(place.trimmingCharacters(in: .whitespaces)),
                ])
            )
        )
    }
}
