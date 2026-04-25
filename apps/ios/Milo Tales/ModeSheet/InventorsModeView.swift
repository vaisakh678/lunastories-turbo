//
//  InventorsModeView.swift
//  Milo Tales
//

import SwiftUI

struct InventorsModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: () -> Void

    enum Step: Hashable { case place }

    @State private var inventor: PickOption?
    @State private var place: String = ""

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
        inventorPickStep
            .navigationDestination(for: Step.self) { step in
                switch step {
                case .place: placeStep
                }
            }
    }

    private var inventorPickStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Pick an inventor", subtitle: "Who joins the story?")
                    .padding(.top, 16)
                    .padding(.bottom, 16)
                OptionGrid(options: inventorOptions) { handlePickInventor($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
    }

    private var placeStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                    .padding(.top, 16)
                    .padding(.bottom, 16)
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
        .modeStepChrome(onClose: onClose)
    }

    private func handlePickInventor(_ option: PickOption) {
        inventor = option
        path.append(Step.place)
    }

    private func handleSubmitPlace() {
        guard !place.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        onComplete()
    }
}
