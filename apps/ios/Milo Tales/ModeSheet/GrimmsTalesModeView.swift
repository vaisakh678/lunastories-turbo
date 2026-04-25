//
//  GrimmsTalesModeView.swift
//  Milo Tales
//

import SwiftUI

struct GrimmsTalesModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: () -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let totalSteps = 2

    private let characterOptions: [PickOption] = [
        .init(title: "Cinderella",        symbolName: "sparkles",       tint: .yellow),
        .init(title: "Red Riding Hood",   symbolName: "figure.child",   tint: .red),
        .init(title: "Hansel and Gretel", symbolName: "house.fill",     tint: .brown),
        .init(title: "Snow White",        symbolName: "heart.fill",     tint: .pink),
        .init(title: "Rapunzel",          symbolName: "scissors",       tint: .yellow),
        .init(title: "Rumpelstiltskin",   symbolName: "wand.and.rays",  tint: .orange),
        .init(title: "Sleeping Beauty",   symbolName: "moon.zzz.fill",  tint: .indigo),
        .init(title: "The Frog Prince",   symbolName: "crown.fill",     tint: .green),
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
                ProgressDots(currentIndex: 0, total: totalSteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
                PlainStepHeader(title: "Pick a character", subtitle: "Who joins the story?")
                    .padding(.bottom, 16)
                OptionGrid(options: characterOptions) { handlePick($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
    }

    private var placeStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                ProgressDots(currentIndex: 1, total: totalSteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
                PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                    .padding(.bottom, 16)
                PlaceTextInput(
                    text: $place,
                    placeholder: "e.g. an enchanted forest",
                    isLastStep: true,
                    onSubmit: handleSubmitPlace
                )
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
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
