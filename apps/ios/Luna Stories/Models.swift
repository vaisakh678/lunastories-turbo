//
//  Models.swift
//  Luna Stories
//

import SwiftUI

nonisolated enum CharacterRole: String, Identifiable, Codable {
    case main
    case side

    var id: Self { self }

    var sectionTitle: String {
        switch self {
        case .main: "Main Characters"
        case .side: "Side Characters"
        }
    }

    var addPromptTitle: String {
        switch self {
        case .main: "New Main Character"
        case .side: "New Side Character"
        }
    }

    var defaultTintName: String {
        switch self {
        case .main: "orange"
        case .side: "gray"
        }
    }
}

nonisolated enum Gender: String, CaseIterable, Identifiable, Codable {
    case male
    case female
    case na

    var id: Self { self }

    var displayName: String {
        switch self {
        case .male: "Male"
        case .female: "Female"
        case .na: "N/A"
        }
    }
}

nonisolated enum CharacterRelation: String, CaseIterable, Identifiable, Codable {
    case parent
    case grandparent
    case friend
    case pet
    case sibling
    case other
    case fictional

    var id: Self { self }

    var displayName: String {
        switch self {
        case .parent: "Parent"
        case .grandparent: "Grandparent"
        case .friend: "Friend"
        case .pet: "Pet"
        case .sibling: "Sibling"
        case .other: "Other"
        case .fictional: "Fictional"
        }
    }

    var icon: String {
        switch self {
        case .parent: "figure.and.child.holdinghands"
        case .grandparent: "person.2.fill"
        case .friend: "person.fill.checkmark"
        case .pet: "pawprint.fill"
        case .sibling: "person.2"
        case .other: "person.fill.questionmark"
        case .fictional: "sparkles"
        }
    }
}

nonisolated enum ColorPalette {
    static func color(for name: String) -> Color {
        switch name.lowercased() {
        case "orange": .orange
        case "yellow": .yellow
        case "red": .red
        case "pink": .pink
        case "purple": .purple
        case "indigo": .indigo
        case "blue": .blue
        case "cyan": .cyan
        case "teal": .teal
        case "mint": .mint
        case "green": .green
        case "brown": .brown
        case "gray": .gray
        case "black": .black
        case "white": .white
        default: .accentColor
        }
    }
}

nonisolated struct Character: Identifiable, Codable {
    let id: UUID
    let name: String
    let role: CharacterRole
    let symbolName: String
    let tintName: String
    let tagline: String
    var relation: CharacterRelation? = nil
    var age: Int? = nil
    var gender: Gender? = nil
    var hairColor: String? = nil
    var eyeColor: String? = nil
    var hairstyle: String? = nil
    var interests: [String] = []
    var extraInterestNote: String = ""

    init(
        id: UUID = UUID(),
        name: String,
        role: CharacterRole,
        symbolName: String,
        tintName: String,
        tagline: String = "",
        relation: CharacterRelation? = nil,
        age: Int? = nil,
        gender: Gender? = nil,
        hairColor: String? = nil,
        eyeColor: String? = nil,
        hairstyle: String? = nil,
        interests: [String] = [],
        extraInterestNote: String = ""
    ) {
        self.id = id
        self.name = name
        self.role = role
        self.symbolName = symbolName
        self.tintName = tintName
        self.tagline = tagline
        self.relation = relation
        self.age = age
        self.gender = gender
        self.hairColor = hairColor
        self.eyeColor = eyeColor
        self.hairstyle = hairstyle
        self.interests = interests
        self.extraInterestNote = extraInterestNote
    }

    var tint: Color { ColorPalette.color(for: tintName) }
}
