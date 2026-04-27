//
//  JungleBookModeView.swift
//  Milo Tales
//

import SwiftUI

struct JungleBookModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?

    @State private var showingCustomPlace: Bool = false
    @State private var customPlaceText: String = ""

    private let placeOptions: [PickOption] = [
        .init(title: "Bamboo Grove",     symbolName: "leaf.fill",              tint: .green),
        .init(title: "Rainforest",       symbolName: "tree.fill",              tint: .mint),
        .init(title: "Crocodile River",  symbolName: "water.waves",            tint: .blue),
        .init(title: "Wolf Cave",        symbolName: "mountain.2.fill",        tint: .gray),
        .init(title: "Ancient Ruins",    symbolName: "building.columns.fill",  tint: .brown),
        .init(title: "King's Throne",    symbolName: "crown.fill",             tint: .yellow),
    ]

    private let characterOptions: [PickOption] = [
        .init(title: "Mowgli",      symbolName: "figure.child",   tint: .orange, imageName: "mowgli"),
        .init(title: "Baloo",       symbolName: "teddybear.fill", tint: .brown,  imageName: "baloo"),
        .init(title: "Bagheera",    symbolName: "cat.fill",       tint: .indigo, imageName: "bagheera"),
        .init(title: "Shere Khan",  symbolName: "cat.fill",       tint: .orange, imageName: "shere_khan"),
        .init(title: "Koo",         symbolName: "lizard.fill",    tint: .green,  imageName: "koo"),
        .init(title: "King Louie",  symbolName: "pawprint.fill",  tint: .yellow, imageName: "king_louie"),
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
        onComplete(
            StoryInputPayload(
                modeKey: "jungle_book",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(option.title),
                ])
            )
        )
    }
}
