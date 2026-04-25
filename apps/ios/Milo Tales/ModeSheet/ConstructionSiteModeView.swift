//
//  ConstructionSiteModeView.swift
//  Milo Tales
//

import SwiftUI

struct ConstructionSiteModeView: View {
    let characters: [Character]
    let onClose: () -> Void
    let onBackToParent: () -> Void
    let onComplete: () -> Void

    @State private var stepIndex: Int = 0
    @State private var picked: PickOption?
    @State private var place: String = ""
    @State private var direction: TransitionDirection = .forward

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
        VStack(spacing: 0) {
            ModeTopBar(onClose: onClose, onBack: handleBack)
                .padding(.horizontal, 20)
                .padding(.top, 16)

            ProgressDots(currentIndex: stepIndex, total: totalSteps)
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 16)

            ZStack {
                stepBody
                    .id(stepIndex)
                    .transition(.slide(direction))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
        }
        .animation(.easeInOut(duration: 0.3), value: stepIndex)
    }

    @ViewBuilder
    private var stepBody: some View {
        switch stepIndex {
        case 0:
            VStack(spacing: 0) {
                PlainStepHeader(title: "Pick a character", subtitle: "Who joins the story?")
                    .padding(.bottom, 16)
                ScrollView {
                    OptionGrid(options: characterOptions) { handlePick($0) }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                }
            }
        case 1:
            VStack(spacing: 0) {
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
        default:
            EmptyView()
        }
    }

    private func handlePick(_ option: PickOption) {
        picked = option
        direction = .forward
        stepIndex = 1
    }

    private func handleSubmitPlace() {
        guard !place.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        onComplete()
    }

    private func handleBack() {
        if stepIndex > 0 {
            direction = .backward
            stepIndex -= 1
        } else {
            onBackToParent()
        }
    }
}
