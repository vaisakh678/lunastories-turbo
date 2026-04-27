//
//  VegetableModeView.swift
//  Milo Tales
//

import SwiftUI

struct VegetableModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let characterOptions: [PickOption] = [
        .init(title: "Bella the Broccoli", symbolName: "leaf.fill",   tint: .green,  imageName: "bella_the_broccoli"),
        .init(title: "Carla the Carrot",   symbolName: "carrot.fill", tint: .orange, imageName: "carla_the_carrot"),
        .init(title: "Olivia the Onion",   symbolName: "circle.fill", tint: .purple, imageName: "olivia_the_onion"),
        .init(title: "Peppy the Pepper",   symbolName: "flame.fill",  tint: .red,    imageName: "peppy_the_pepper"),
        .init(title: "Peter the Potato",   symbolName: "circle.fill", tint: .brown,  imageName: "peter_the_potato"),
        .init(title: "Tommy the Tomato",   symbolName: "circle.fill", tint: .red,    imageName: "tommy_the_tomato"),
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
                    placeholder: "e.g. a sunny garden patch",
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
                modeKey: "vegetable",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(place.trimmingCharacters(in: .whitespaces)),
                ])
            )
        )
    }
}
