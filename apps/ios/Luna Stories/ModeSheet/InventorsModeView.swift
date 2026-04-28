//
//  InventorsModeView.swift
//  Luna Stories
//

import SwiftUI

struct InventorsModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload, [GenerationCue]) -> Void

    enum Step: Hashable { case place }

    @State private var inventor: PickOption?

    @State private var showingCustomPlace: Bool = false
    @State private var customPlaceText: String = ""

    private let placeOptions: [PickOption] = [
        .init(title: "Laboratory",  symbolName: "atom",                   tint: .mint,   imageName: "laboratory"),
        .init(title: "Observatory", symbolName: "moon.stars.fill",        tint: .indigo, imageName: "observatory"),
        .init(title: "Workshop",    symbolName: "wrench.adjustable.fill", tint: .gray,   imageName: "workshop"),
        .init(title: "Library",     symbolName: "books.vertical.fill",    tint: .brown,  imageName: "library"),
        .init(title: "Garden",      symbolName: "leaf.fill",              tint: .green,  imageName: "garden"),
        .init(title: "Classroom",   symbolName: "book.fill",              tint: .orange, imageName: "classroom"),
    ]

private let inventorOptions: [PickOption] = [
        .init(title: "Ada Lovelace",         symbolName: "laptopcomputer",    tint: .pink,   imageName: "ada_lovelace"),
        .init(title: "Albert Einstein",      symbolName: "function",          tint: .gray,   imageName: "albert_einstein"),
        .init(title: "Charles Darwin",       symbolName: "leaf.fill",         tint: .green,  imageName: "charles_darwin"),
        .init(title: "Florence Nightingale", symbolName: "cross.case.fill",   tint: .red,    imageName: "florence_nightingale"),
        .init(title: "Galileo Galilei",      symbolName: "moon.stars.fill",   tint: .indigo, imageName: "galileo_galilei"),
        .init(title: "Isaac Newton",         symbolName: "atom",              tint: .orange, imageName: "isaac_newton"),
        .init(title: "Leonardo da Vinci",    symbolName: "paintpalette.fill", tint: .yellow, imageName: "leonardo_da_vinci"),
        .init(title: "Marie Curie",          symbolName: "atom",              tint: .mint,   imageName: "marie_curie"),
        .init(title: "Nikola Tesla",         symbolName: "bolt.fill",         tint: .blue,   imageName: "nikola_tesla"),
        .init(title: "Rosalind Franklin",    symbolName: "waveform.path",     tint: .purple, imageName: "rosalind_franklin"),
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
        .modeStepChrome(isRoot: false, onClose: onClose)
    }

    private var placeStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Choose a place", subtitle: "Where does the story happen?")
                    .padding(.top, 16)
                    .padding(.bottom, 16)
                OptionGrid(options: placeOptions, onOther: { showingCustomPlace = true }) { handlePickPlace($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
        .sheet(isPresented: $showingCustomPlace) {
            CustomTextSheet(
                title: "Custom place",
                prompt: "Type any place — real or imagined.",
                placeholder: "e.g. Grandma's house",
                continueLabel: "Continue",
                text: $customPlaceText
            ) { trimmed in
                showingCustomPlace = false
                handlePickPlace(.init(title: trimmed, symbolName: "pencil", tint: .secondary))
            }
        }
    }

    private func handlePickInventor(_ option: PickOption) {
        inventor = option
        path.append(Step.place)
    }

    private func handlePickPlace(_ option: PickOption) {
        var cues: [GenerationCue] = [
            GenerationCue(label: "Inventors", imageName: "inventors"),
        ]
        if let inventor { cues.append(inventor.asCue()) }
        cues.append(option.asCue())

        onComplete(
            StoryInputPayload(
                modeKey: "inventors",
                input: .object([
                    "inventor": inventor.map { .string($0.title) } ?? .null,
                    "place": .string(option.title),
                ])
            ),
            cues
        )
    }
}
