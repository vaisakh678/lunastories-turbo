//
//  JungleBookModeView.swift
//  Milo Tales
//

import SwiftUI

struct JungleBookModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: () -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let totalSteps = 2

    private let characterOptions: [PickOption] = [
        .init(title: "Mowgli",      symbolName: "figure.child",   tint: .orange),
        .init(title: "Baloo",       symbolName: "teddybear.fill", tint: .brown),
        .init(title: "Bagheera",    symbolName: "cat.fill",       tint: .indigo),
        .init(title: "Shere Khan",  symbolName: "cat.fill",       tint: .orange),
        .init(title: "Kaa",         symbolName: "lizard.fill",    tint: .green),
        .init(title: "King Louie",  symbolName: "pawprint.fill",  tint: .yellow),
    ]

    var body: some View {
        characterPickStep
            .navigationDestination(for: Step.self) { step in
                switch step {
                case .place:
                    placeStep
                        .toolbar(.hidden, for: .navigationBar)
                        .navigationBarBackButtonHidden(true)
                }
            }
    }

    private var characterPickStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                ModeTopBar(onClose: onClose)
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                ProgressDots(currentIndex: 0, total: totalSteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    .padding(.bottom, 16)
                PlainStepHeader(title: "Pick a character", subtitle: "Who joins the story?")
                    .padding(.bottom, 16)
                OptionGrid(options: characterOptions) { handlePick($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
    }

    private var placeStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                ModeTopBar(onClose: onClose)
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                ProgressDots(currentIndex: 1, total: totalSteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    .padding(.bottom, 16)
                PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                    .padding(.bottom, 16)
                PlaceTextInput(
                    text: $place,
                    placeholder: "e.g. deep in the rainforest",
                    isLastStep: true,
                    onSubmit: handleSubmitPlace
                )
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
    }

    private func handlePick(_ option: PickOption) {
        picked = option
        path.append(Step.place)
    }

    private func handleSubmitPlace() {
        guard !place.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        onComplete()
    }
}
