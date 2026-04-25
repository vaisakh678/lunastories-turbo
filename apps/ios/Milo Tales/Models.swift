//
//  Models.swift
//  Milo Tales
//

import SwiftUI

enum CharacterRole: Identifiable {
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

    var defaultTint: Color {
        switch self {
        case .main: .orange
        case .side: .gray
        }
    }
}

enum Gender: String, CaseIterable, Identifiable {
    case male = "Male"
    case female = "Female"
    case na = "N/A"
    var id: Self { self }
}

struct Character: Identifiable {
    let id = UUID()
    let name: String
    let role: CharacterRole
    let symbolName: String
    let tint: Color
    let tagline: String
    var age: Int? = nil
    var gender: Gender? = nil
    var hairColor: String? = nil
    var eyeColor: String? = nil
    var hairstyle: String? = nil
    var interests: [String] = []
    var extraInterestNote: String = ""
}

struct Story: Identifiable {
    let id = UUID()
    let title: String
    let summary: String
    let symbolName: String
    let tint: Color
    let duration: String
    let createdAt: String
    var totalSeconds: Int = 300
    var blocks: [StoryBlock] = []
}

struct StoryBlock: Identifiable {
    let id = UUID()
    let kind: Kind

    enum Kind {
        case text(String)
        case illustration(symbolName: String, tint: Color)
    }
}
