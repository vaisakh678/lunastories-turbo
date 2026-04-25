//
//  VegetableModeView.swift
//  Milo Tales
//

import SwiftUI

struct VegetableModeView: View {
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
        .init(title: "Bella the Broccoli", symbolName: "leaf.fill",   tint: .green),
        .init(title: "Carla the Carrot",   symbolName: "carrot.fill", tint: .orange),
        .init(title: "Olivia the Onion",   symbolName: "circle.fill", tint: .purple),
        .init(title: "Peppy the Pepper",   symbolName: "flame.fill",  tint: .red),
        .init(title: "Peter the Potato",   symbolName: "circle.fill", tint: .brown),
        .init(title: "Tommy the Tomato",   symbolName: "circle.fill", tint: .red),
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
                        placeholder: "e.g. a sunny garden patch",
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
