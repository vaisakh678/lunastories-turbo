//
//  ConstructionSiteModeView.swift
//  Milo Tales
//

import SwiftUI

struct ConstructionSiteModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable { case place }

    @State private var picked: PickOption?

    @State private var showingCustomPlace: Bool = false
    @State private var customPlaceText: String = ""

    private let placeOptions: [PickOption] = [
        .init(title: "New Building Site", symbolName: "hammer.fill",          tint: .orange),
        .init(title: "Road Project",      symbolName: "road.lanes",           tint: .gray),
        .init(title: "Bridge",            symbolName: "rectangle.split.3x1.fill", tint: .brown),
        .init(title: "Tall Tower",        symbolName: "building.2.fill",      tint: .blue),
        .init(title: "Park Renovation",   symbolName: "tree.fill",            tint: .green),
        .init(title: "Tunnel",            symbolName: "arrow.left.and.right.circle.fill", tint: .indigo),
    ]

    private let characterOptions: [PickOption] = [
        .init(title: "Benny the Bulldozer",             symbolName: "car.fill",       tint: .yellow, imageName: "benny_the_bulldozer"),
        .init(title: "Charlie the Construction Worker", symbolName: "person.fill",    tint: .orange, imageName: "charlie_the_construction_worker"),
        .init(title: "Kara the Crane",                  symbolName: "arrow.up.right", tint: .blue,   imageName: "kara_the_crane"),
        .init(title: "Molly the Mixer",                 symbolName: "drop.fill",      tint: .gray,   imageName: "molly_the_mixer"),
        .init(title: "Patty the Paver",                 symbolName: "rectangle.fill", tint: .brown,  imageName: "patty_the_paver"),
        .init(title: "Sammy the Safety Cone",           symbolName: "triangle.fill",  tint: .orange, imageName: "sammy_the_safety_cone"),
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
                modeKey: "construction_site",
                input: .object([
                    "picked": picked.map { .string($0.title) } ?? .null,
                    "place": .string(option.title),
                ])
            )
        )
    }
}
