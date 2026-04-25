//
//  ConstructionSiteModeView.swift
//  Milo Tales
//

import SwiftUI

struct ConstructionSiteModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: () -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?
    @State private var place: String = ""

    private let totalSteps = 2

    private let characterOptions: [PickOption] = [
        .init(title: "Benny the Bulldozer",          symbolName: "car.fill",       tint: .yellow),
        .init(title: "Charlie the Construction Worker", symbolName: "person.fill", tint: .orange),
        .init(title: "Kara the Crane",               symbolName: "arrow.up.right", tint: .blue),
        .init(title: "Molly the Mixer",              symbolName: "drop.fill",      tint: .gray),
        .init(title: "Patty the Paver",              symbolName: "rectangle.fill", tint: .brown),
        .init(title: "Sammy the Safety Cone",        symbolName: "triangle.fill",  tint: .orange),
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
        VStack(spacing: 0) {
            ModeTopBar(onClose: onClose, onBack: popPath)
                .padding(.horizontal, 20)
                .padding(.top, 16)
            ProgressDots(currentIndex: 0, total: totalSteps)
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 16)
            PlainStepHeader(title: "Pick a character", subtitle: "Who joins the story?")
                .padding(.bottom, 16)
            ScrollView {
                OptionGrid(options: characterOptions) { handlePick($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
    }

    private var placeStep: some View {
        VStack(spacing: 0) {
            ModeTopBar(onClose: onClose, onBack: popPath)
                .padding(.horizontal, 20)
                .padding(.top, 16)
            ProgressDots(currentIndex: 1, total: totalSteps)
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 16)
            PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                .padding(.bottom, 16)
            ScrollView {
                PlaceTextInput(
                    text: $place,
                    placeholder: "e.g. a busy downtown site",
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

    private func popPath() {
        if !path.isEmpty { path.removeLast() }
    }
}
