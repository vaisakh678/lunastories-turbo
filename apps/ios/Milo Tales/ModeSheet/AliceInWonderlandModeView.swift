//
//  AliceInWonderlandModeView.swift
//  Milo Tales
//

import SwiftUI

struct AliceInWonderlandModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload, [GenerationCue]) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?

    @State private var showingCustomPlace: Bool = false
    @State private var customPlaceText: String = ""

    private let placeOptions: [PickOption] = [
        .init(title: "Tea Party Garden",       symbolName: "cup.and.saucer.fill",    tint: .pink,   imageName: "tea_party_garden"),
        .init(title: "Croquet Field",          symbolName: "heart.fill",             tint: .red,    imageName: "croquet_field"),
        .init(title: "Caterpillar's Mushroom", symbolName: "leaf.fill",              tint: .green,  imageName: "caterpillars_mushroom"),
        .init(title: "Down the Rabbit Hole",   symbolName: "arrow.down.circle.fill", tint: .gray,   imageName: "down_the_rabbit_hole"),
        .init(title: "Cheshire's Tree",        symbolName: "tree.fill",              tint: .purple, imageName: "cheshires_tree"),
        .init(title: "Mad Hatter's House",     symbolName: "house.fill",             tint: .indigo, imageName: "mad_hatters_house"),
    ]

    private let characterOptions: [PickOption] = [
        .init(title: "Alice",            symbolName: "figure.child",        tint: .blue,   imageName: "alice"),
        .init(title: "Mad Hatter",       symbolName: "cup.and.saucer.fill", tint: .green,  imageName: "mad_hatter"),
        .init(title: "Queen of Hearts",  symbolName: "heart.fill",          tint: .red,    imageName: "queen_of_hearts"),
        .init(title: "Cheshire Cat",     symbolName: "cat.fill",            tint: .purple, imageName: "cheshire_cat"),
        .init(title: "The White Rabbit", symbolName: "hare.fill",           tint: .gray,   imageName: "the_white_rabbit"),
        .init(title: "Caterpillar",      symbolName: "ant.fill",            tint: .green,  imageName: "caterpillar"),
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

    private func handlePick(_ option: PickOption) {
        picked = option
        path.append(Step.place)
    }

    private func handlePickPlace(_ option: PickOption) {
        var cues: [GenerationCue] = [
            GenerationCue(label: "Alice in Wonderland", imageName: "alice_in_wonderland"),
        ]
        if let picked { cues.append(picked.asCue()) }
        cues.append(option.asCue())

        onComplete(
            StoryInputPayload(
                modeKey: "alice_in_wonderland",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(option.title),
                ])
            ),
            cues
        )
    }
}
