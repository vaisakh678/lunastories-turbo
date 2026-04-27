//
//  EnvironmentModeView.swift
//  Milo Tales
//

import SwiftUI

struct EnvironmentModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let characterOptions: [PickOption] = [
        .init(title: "Greeny the Tree",        symbolName: "tree.fill",            tint: .green,  imageName: "greeny_the_tree"),
        .init(title: "Polly the Pollinator",   symbolName: "ant.fill",             tint: .yellow, imageName: "polly_the_pollinator"),
        .init(title: "Recyclo the Bin",        symbolName: "arrow.3.trianglepath", tint: .mint,   imageName: "recyclo_the_bin"),
        .init(title: "Sunny the Solar Panel",  symbolName: "sun.max.fill",         tint: .orange, imageName: "sunny_the_solar_panel"),
        .init(title: "Wally the Water Drop",   symbolName: "drop.fill",            tint: .blue,   imageName: "wally_the_water_drop"),
        .init(title: "Windy the Wind Turbine", symbolName: "wind",                 tint: .teal,   imageName: "windy_the_wind_turbine"),
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
                    placeholder: "e.g. a meadow at sunrise",
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
                modeKey: "environment",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(place.trimmingCharacters(in: .whitespaces)),
                ])
            )
        )
    }
}
