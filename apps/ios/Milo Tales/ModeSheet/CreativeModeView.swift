//
//  CreativeModeView.swift
//  Milo Tales
//

import SwiftUI

struct CreativeModeView: View {
    let characters: [Character]
    let onClose: () -> Void
    let onBackToParent: () -> Void
    let onComplete: () -> Void

    @State private var phase: Phase = .type
    @State private var charIndex: Int = 0
    @State private var typeByChar: [UUID: PickOption] = [:]
    @State private var professionByChar: [UUID: PickOption] = [:]
    @State private var moral: PickOption?
    @State private var direction: TransitionDirection = .forward

    enum Phase: Hashable { case type, profession, moral }

    private var totalSubsteps: Int {
        max(characters.count * 2 + 1, 1)
    }

    private var currentSubstepIndex: Int {
        switch phase {
        case .type: return charIndex
        case .profession: return characters.count + charIndex
        case .moral: return characters.count * 2
        }
    }

    private var currentCharacter: Character? {
        guard phase != .moral, charIndex < characters.count else { return nil }
        return characters[charIndex]
    }

    private let typeOptions: [PickOption] = [
        .init(title: "Fox",      symbolName: "pawprint.fill",  tint: .orange),
        .init(title: "Dragon",   symbolName: "flame.fill",     tint: .red),
        .init(title: "Elf",      symbolName: "leaf.fill",      tint: .green),
        .init(title: "Dinosaur", symbolName: "lizard.fill",    tint: .mint),
        .init(title: "Robot",    symbolName: "gearshape.fill", tint: .gray),
        .init(title: "Unicorn",  symbolName: "sparkles",       tint: .pink),
        .init(title: "Dog",      symbolName: "dog.fill",       tint: .brown),
        .init(title: "Bear",     symbolName: "teddybear.fill", tint: .yellow),
        .init(title: "Cat",      symbolName: "cat.fill",       tint: .orange),
        .init(title: "Rabbit",   symbolName: "hare.fill",      tint: .gray),
        .init(title: "Dolphin",  symbolName: "fish.fill",      tint: .blue),
        .init(title: "Fairy",    symbolName: "wand.and.stars", tint: .purple),
    ]

    private let professionOptions: [PickOption] = [
        .init(title: "Astronaut",      symbolName: "globe.americas.fill",     tint: .blue),
        .init(title: "Detective",      symbolName: "magnifyingglass",         tint: .gray),
        .init(title: "Police Officer", symbolName: "shield.fill",             tint: .blue),
        .init(title: "Prince",         symbolName: "crown.fill",              tint: .yellow),
        .init(title: "Superhero",      symbolName: "bolt.fill",               tint: .red),
        .init(title: "Wizard",         symbolName: "wand.and.stars",          tint: .purple),
        .init(title: "Athlete",        symbolName: "figure.run",              tint: .green),
        .init(title: "Teacher",        symbolName: "book.fill",               tint: .orange),
        .init(title: "Cowboy",         symbolName: "lasso",                   tint: .brown),
        .init(title: "Doctor",         symbolName: "stethoscope",             tint: .red),
        .init(title: "Explorer",       symbolName: "binoculars.fill",         tint: .indigo),
        .init(title: "Mechanic",       symbolName: "wrench.adjustable.fill",  tint: .gray),
        .init(title: "Ninja",          symbolName: "figure.martial.arts",     tint: .black),
        .init(title: "Pilot",          symbolName: "airplane",                tint: .blue),
        .init(title: "Scientist",      symbolName: "atom",                    tint: .mint),
        .init(title: "Spy",            symbolName: "eye.fill",                tint: .indigo),
    ]

    private let moralOptions: [PickOption] = [
        .init(title: "No specific moral", symbolName: "minus.circle", tint: .gray),
        .init(title: "Always be kind", symbolName: "heart.fill", tint: .pink),
        .init(title: "Be honest", symbolName: "checkmark.seal.fill", tint: .blue),
        .init(title: "Be the change you want to see in the world", symbolName: "globe", tint: .green),
        .init(title: "Always tell the truth because a liar won't be trusted", symbolName: "checkmark.shield.fill", tint: .indigo),
        .init(title: "Think before you act", symbolName: "brain", tint: .purple),
        .init(title: "Never give up", symbolName: "flame.fill", tint: .red),
        .init(title: "Respect others", symbolName: "hand.raised.fill", tint: .orange),
        .init(title: "The importance of being a good friend", symbolName: "person.2.fill", tint: .teal),
        .init(title: "Learning to forgive", symbolName: "arrow.uturn.backward.circle.fill", tint: .pink),
        .init(title: "You can't always get what you want", symbolName: "hourglass", tint: .gray),
        .init(title: "Good things come to those who wait", symbolName: "clock.fill", tint: .yellow),
        .init(title: "Keeping promises and respecting boundaries", symbolName: "lock.fill", tint: .blue),
        .init(title: "Actions speak louder than words", symbolName: "bolt.fill", tint: .green),
        .init(title: "Don't be greedy, be content with what you have", symbolName: "leaf.fill", tint: .mint),
        .init(title: "Treat others the way you want to be treated", symbolName: "arrow.left.arrow.right", tint: .purple),
        .init(title: "Always be fair to others", symbolName: "scalemass", tint: .indigo),
        .init(title: "Learning to respect others", symbolName: "person.fill.checkmark", tint: .orange),
    ]

    var body: some View {
        VStack(spacing: 0) {
            ModeTopBar(onClose: onClose, onBack: handleBack)
                .padding(.horizontal, 20)
                .padding(.top, 16)

            ProgressDots(currentIndex: currentSubstepIndex, total: totalSubsteps)
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 16)

            ZStack {
                stepBody
                    .id(currentSubstepIndex)
                    .transition(.slide(direction))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()
        }
        .animation(.easeInOut(duration: 0.3), value: currentSubstepIndex)
    }

    @ViewBuilder
    private var stepBody: some View {
        switch phase {
        case .type:
            VStack(spacing: 0) {
                if let character = currentCharacter {
                    CharacterStepHeader(character: character, title: "Choose a type")
                        .padding(.bottom, 16)
                }
                ScrollView {
                    OptionGrid(options: typeOptions) { handleType($0) }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                }
            }
        case .profession:
            VStack(spacing: 0) {
                if let character = currentCharacter {
                    CharacterStepHeader(character: character, title: "Choose a profession")
                        .padding(.bottom, 16)
                }
                ScrollView {
                    OptionGrid(options: professionOptions) { handleProfession($0) }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                }
            }
        case .moral:
            VStack(spacing: 0) {
                PlainStepHeader(title: "Choose a moral", subtitle: "Pick a lesson for your story.")
                    .padding(.bottom, 16)
                ScrollView {
                    OptionList(options: moralOptions) { handleMoral($0) }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                }
            }
        }
    }

    private func handleType(_ option: PickOption) {
        guard let character = currentCharacter else { return }
        typeByChar[character.id] = option
        direction = .forward
        if charIndex < characters.count - 1 {
            charIndex += 1
        } else {
            phase = .profession
            charIndex = 0
        }
    }

    private func handleProfession(_ option: PickOption) {
        guard let character = currentCharacter else { return }
        professionByChar[character.id] = option
        direction = .forward
        if charIndex < characters.count - 1 {
            charIndex += 1
        } else {
            phase = .moral
            charIndex = 0
        }
    }

    private func handleMoral(_ option: PickOption) {
        moral = option
        onComplete()
    }

    private func handleBack() {
        direction = .backward
        switch phase {
        case .type:
            if charIndex > 0 {
                charIndex -= 1
            } else {
                onBackToParent()
            }
        case .profession:
            if charIndex > 0 {
                charIndex -= 1
            } else {
                phase = .type
                charIndex = max(characters.count - 1, 0)
            }
        case .moral:
            phase = .profession
            charIndex = max(characters.count - 1, 0)
        }
    }
}
