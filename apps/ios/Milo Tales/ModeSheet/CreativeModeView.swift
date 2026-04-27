//
//  CreativeModeView.swift
//  Milo Tales
//

import SwiftUI

struct CreativeModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: (StoryInputPayload) -> Void

    enum Step: Hashable {
        case type(charIndex: Int)
        case profession(charIndex: Int)
        case moral
    }

    @State private var typeByChar: [UUID: PickOption] = [:]
    @State private var professionByChar: [UUID: PickOption] = [:]
    @State private var moral: PickOption?

    @State private var showInlineTypeTitle = false
    @State private var showInlineProfessionTitle = false
    @State private var showInlineMoralTitle = false

    @State private var showingCustomMoral: Bool = false
    @State private var customMoralText: String = ""

    private let typeOptions: [PickOption] = [
        .init(title: "Fox",      symbolName: "pawprint.fill",  tint: .orange, imageName: "fox"),
        .init(title: "Dragon",   symbolName: "flame.fill",     tint: .red,    imageName: "dragon"),
        .init(title: "Elf",      symbolName: "leaf.fill",      tint: .green,  imageName: "elf"),
        .init(title: "Dinosaur", symbolName: "lizard.fill",    tint: .mint,   imageName: "dinosaur"),
        .init(title: "Robot",    symbolName: "gearshape.fill", tint: .gray,   imageName: "robot"),
        .init(title: "Unicorn",  symbolName: "sparkles",       tint: .pink,   imageName: "unicorn"),
        .init(title: "Dog",      symbolName: "dog.fill",       tint: .brown,  imageName: "dog"),
        .init(title: "Bear",     symbolName: "teddybear.fill", tint: .yellow, imageName: "bear"),
        .init(title: "Cat",      symbolName: "cat.fill",       tint: .orange, imageName: "cat"),
        .init(title: "Rabbit",   symbolName: "hare.fill",      tint: .gray,   imageName: "rabbit"),
        .init(title: "Dolphin",  symbolName: "fish.fill",      tint: .blue,   imageName: "dolphin"),
        .init(title: "Fairy",    symbolName: "wand.and.stars", tint: .purple, imageName: "fairy"),
    ]

    private let professionOptions: [PickOption] = [
        .init(title: "Astronaut",      symbolName: "globe.americas.fill",     tint: .blue,   imageName: "astronaut"),
        .init(title: "Detective",      symbolName: "magnifyingglass",         tint: .gray,   imageName: "detective"),
        .init(title: "Police Officer", symbolName: "shield.fill",             tint: .blue,   imageName: "police_officer"),
        .init(title: "Prince",         symbolName: "crown.fill",              tint: .yellow, imageName: "prince"),
        .init(title: "Superhero",      symbolName: "bolt.fill",               tint: .red,    imageName: "superhero"),
        .init(title: "Wizard",         symbolName: "wand.and.stars",          tint: .purple, imageName: "wizard"),
        .init(title: "Athlete",        symbolName: "figure.run",              tint: .green,  imageName: "athlete"),
        .init(title: "Teacher",        symbolName: "book.fill",               tint: .orange, imageName: "teacher"),
        .init(title: "Cowboy",         symbolName: "lasso",                   tint: .brown,  imageName: "cowboy"),
        .init(title: "Doctor",         symbolName: "stethoscope",             tint: .red,    imageName: "doctor"),
        .init(title: "Explorer",       symbolName: "binoculars.fill",         tint: .indigo, imageName: "explorer"),
        .init(title: "Mechanic",       symbolName: "wrench.adjustable.fill",  tint: .gray,   imageName: "mechanic"),
        .init(title: "Ninja",          symbolName: "figure.martial.arts",     tint: .black,  imageName: "ninja"),
        .init(title: "Pilot",          symbolName: "airplane",                tint: .blue,   imageName: "pilot"),
        .init(title: "Scientist",      symbolName: "atom",                    tint: .mint,   imageName: "scientist"),
        .init(title: "Spy",            symbolName: "eye.fill",                tint: .indigo, imageName: "spy"),
    ]

    private let moralOptions: [PickOption] = [
        .init(title: "No specific moral",                       symbolName: "minus.circle",            tint: .gray),
        .init(title: "Always be kind",                          symbolName: "heart.fill",              tint: .pink),
        .init(title: "Be honest",                               symbolName: "checkmark.seal.fill",     tint: .blue),
        .init(title: "Never give up",                           symbolName: "flame.fill",              tint: .red),
        .init(title: "Be a good friend",                        symbolName: "person.2.fill",           tint: .teal),
        .init(title: "Treat others the way you want to be treated", symbolName: "arrow.left.arrow.right", tint: .purple),
        .init(title: "Think before you act",                    symbolName: "brain",                   tint: .indigo),
    ]

    var body: some View {
        // Root = type for character 0
        typeStep(charIndex: 0)
            .navigationDestination(for: Step.self) { step in
                switch step {
                case .type(let i):       typeStep(charIndex: i)
                case .profession(let i): professionStep(charIndex: i)
                case .moral:             moralStep
                }
            }
    }

    private func typeStep(charIndex: Int) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                if charIndex < characters.count {
                    CharacterStepHeader(
                        character: characters[charIndex],
                        title: "Choose a type"
                    )
                    .padding(.bottom, 16)
                    .onScrollVisibilityChange(threshold: 0.1) { isVisible in
                        showInlineTypeTitle = !isVisible
                    }
                }
                OptionGrid(options: typeOptions) { handleType($0, charIndex: charIndex) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
        .scrollAwareToolbarTitle("Choose a type", isShowing: showInlineTypeTitle)
    }

    private func professionStep(charIndex: Int) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                if charIndex < characters.count {
                    CharacterStepHeader(
                        character: characters[charIndex],
                        title: "Choose a profession"
                    )
                    .padding(.bottom, 16)
                    .onScrollVisibilityChange(threshold: 0.1) { isVisible in
                        showInlineProfessionTitle = !isVisible
                    }
                }
                OptionGrid(options: professionOptions) { handleProfession($0, charIndex: charIndex) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
        .scrollAwareToolbarTitle("Choose a profession", isShowing: showInlineProfessionTitle)
    }

    private var moralStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                PlainStepHeader(title: "Choose a moral", subtitle: "Pick a lesson for your story.")
                    .padding(.bottom, 16)
                    .onScrollVisibilityChange(threshold: 0.1) { isVisible in
                        showInlineMoralTitle = !isVisible
                    }
                OptionList(options: moralOptions, onOther: { showingCustomMoral = true }) { handleMoral($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(isRoot: false, onClose: onClose)
        .scrollAwareToolbarTitle("Choose a moral", isShowing: showInlineMoralTitle)
        .sheet(isPresented: $showingCustomMoral) {
            CustomTextSheet(
                title: "Custom moral",
                prompt: "What lesson should the story teach?",
                placeholder: "e.g. Sharing makes everyone happier",
                continueLabel: "Continue",
                text: $customMoralText
            ) { trimmed in
                showingCustomMoral = false
                handleMoral(.init(title: trimmed, symbolName: "pencil", tint: .secondary))
            }
        }
    }

    private func handleType(_ option: PickOption, charIndex: Int) {
        guard charIndex < characters.count else { return }
        typeByChar[characters[charIndex].id] = option
        if charIndex < characters.count - 1 {
            path.append(Step.type(charIndex: charIndex + 1))
        } else {
            path.append(Step.profession(charIndex: 0))
        }
    }

    private func handleProfession(_ option: PickOption, charIndex: Int) {
        guard charIndex < characters.count else { return }
        professionByChar[characters[charIndex].id] = option
        if charIndex < characters.count - 1 {
            path.append(Step.profession(charIndex: charIndex + 1))
        } else {
            path.append(Step.moral)
        }
    }

    private func handleMoral(_ option: PickOption) {
        moral = option
        let typeMap: [String: AnyJSON] = Dictionary(
            uniqueKeysWithValues: typeByChar.map {
                ($0.key.uuidString.lowercased(), .string($0.value.title))
            }
        )
        let professionMap: [String: AnyJSON] = Dictionary(
            uniqueKeysWithValues: professionByChar.map {
                ($0.key.uuidString.lowercased(), .string($0.value.title))
            }
        )
        onComplete(
            StoryInputPayload(
                modeKey: "creative",
                input: .object([
                    "typeByChar": .object(typeMap),
                    "professionByChar": .object(professionMap),
                    "moral": .string(option.title),
                ])
            )
        )
    }
}
