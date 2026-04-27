//
//  GrimmsTalesModeView.swift
//  Milo Tales
//

import SwiftUI

struct GrimmsTalesModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?

    @State private var showingCustomPlace: Bool = false
    @State private var customPlaceText: String = ""

    private let placeOptions: [PickOption] = [
        .init(title: "Enchanted Forest", symbolName: "tree.fill",             tint: .green,  imageName: "enchanted_forest"),
        .init(title: "Castle Tower",     symbolName: "building.columns.fill", tint: .gray,   imageName: "castle_tower"),
        .init(title: "Witch's Cottage",  symbolName: "house.fill",            tint: .brown,  imageName: "witchs_cottage"),
        .init(title: "Royal Garden",     symbolName: "leaf.fill",             tint: .pink,   imageName: "royal_garden"),
        .init(title: "Magic Lake",       symbolName: "water.waves",           tint: .blue,   imageName: "magic_lake"),
        .init(title: "Faraway Kingdom",  symbolName: "crown.fill",            tint: .yellow, imageName: "faraway_kingdom"),
    ]

    private let characterOptions: [PickOption] = [
        .init(title: "Cinderella",        symbolName: "sparkles",      tint: .yellow, imageName: "cinderella"),
        .init(title: "Red Riding Hood",   symbolName: "figure.child",  tint: .red,    imageName: "red_riding_hood"),
        .init(title: "Hansel and Gretel", symbolName: "house.fill",    tint: .brown,  imageName: "hansel_and_gretel"),
        .init(title: "Snow White",        symbolName: "heart.fill",    tint: .pink,   imageName: "snow_white"),
        .init(title: "Rapunzel",          symbolName: "scissors",      tint: .yellow, imageName: "rapunzel"),
        .init(title: "Rumpelstiltskin",   symbolName: "wand.and.rays", tint: .orange, imageName: "rumpelstiltskin"),
        .init(title: "Sleeping Beauty",   symbolName: "moon.zzz.fill", tint: .indigo, imageName: "sleeping_beauty"),
        .init(title: "The Frog Prince",   symbolName: "crown.fill",    tint: .green,  imageName: "the_frog_prince"),
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
                modeKey: "grimms_tales",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(option.title),
                ])
            )
        )
    }
}
