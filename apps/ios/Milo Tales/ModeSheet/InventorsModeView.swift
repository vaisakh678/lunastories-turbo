//
//  InventorsModeView.swift
//  Milo Tales
//

import SwiftUI

struct InventorsModeView: View {
    let characters: [Character]
    let onClose: () -> Void
    let onBackToParent: () -> Void
    let onComplete: () -> Void

    @State private var stepIndex: Int = 0
    @State private var inventor: PickOption?
    @State private var place: String = ""
    @State private var direction: TransitionDirection = .forward

    private let totalSteps = 2

    private let inventorOptions: [PickOption] = [
        .init(title: "Ada Lovelace",         symbolName: "laptopcomputer",     tint: .pink),
        .init(title: "Albert Einstein",      symbolName: "function",           tint: .gray),
        .init(title: "Charles Darwin",       symbolName: "leaf.fill",          tint: .green),
        .init(title: "Florence Nightingale", symbolName: "cross.case.fill",    tint: .red),
        .init(title: "Galileo Galilei",      symbolName: "moon.stars.fill",    tint: .indigo),
        .init(title: "Isaac Newton",         symbolName: "atom",               tint: .orange),
        .init(title: "Leonardo da Vinci",    symbolName: "paintpalette.fill",  tint: .yellow),
        .init(title: "Marie Curie",          symbolName: "atom",               tint: .mint),
        .init(title: "Nikola Tesla",         symbolName: "bolt.fill",          tint: .blue),
        .init(title: "Rosalind Franklin",    symbolName: "waveform.path",      tint: .purple),
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
                PlainStepHeader(title: "Pick an inventor", subtitle: "Who joins the story?")
                    .padding(.bottom, 16)
                ScrollView {
                    OptionGrid(options: inventorOptions) { handlePickInventor($0) }
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
                        placeholder: "e.g. a moonlit observatory",
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

    private func handlePickInventor(_ option: PickOption) {
        inventor = option
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
