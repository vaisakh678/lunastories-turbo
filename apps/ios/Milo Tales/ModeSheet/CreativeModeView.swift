//
//  CreativeModeView.swift
//  Milo Tales
//

import SwiftUI

struct CreativeModeView: View {
    let characters: [Character]
    @Binding var path: NavigationPath
    let onClose: () -> Void
    let onComplete: () -> Void

    enum Step: Hashable {
        case type(charIndex: Int)
        case profession(charIndex: Int)
        case moral
    }

    @State private var typeByChar: [UUID: PickOption] = [:]
    @State private var professionByChar: [UUID: PickOption] = [:]
    @State private var moral: PickOption?

    private var totalSubsteps: Int { max(characters.count * 2 + 1, 1) }

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
                ProgressDots(currentIndex: charIndex, total: totalSubsteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
                if charIndex < characters.count {
                    CharacterStepHeader(
                        character: characters[charIndex],
                        title: "Choose a type"
                    )
                    .padding(.bottom, 16)
                }
                OptionGrid(options: typeOptions) { handleType($0, charIndex: charIndex) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
    }

    private func professionStep(charIndex: Int) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                ProgressDots(currentIndex: characters.count + charIndex, total: totalSubsteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
                if charIndex < characters.count {
                    CharacterStepHeader(
                        character: characters[charIndex],
                        title: "Choose a profession"
                    )
                    .padding(.bottom, 16)
                }
                OptionGrid(options: professionOptions) { handleProfession($0, charIndex: charIndex) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
    }

    private var moralStep: some View {
        ScrollView {
            VStack(spacing: 0) {
                ProgressDots(currentIndex: characters.count * 2, total: totalSubsteps)
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 16)
                PlainStepHeader(title: "Choose a moral", subtitle: "Pick a lesson for your story.")
                    .padding(.bottom, 16)
                OptionList(options: moralOptions) { handleMoral($0) }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
            }
        }
        .modeStepChrome(onClose: onClose)
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
        onComplete()
    }
}
