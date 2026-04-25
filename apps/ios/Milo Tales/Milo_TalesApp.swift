//
//  Milo_TalesApp.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import SwiftUI
import ClerkKit

@main
struct Milo_TalesApp: App {
    init() {
        Clerk.configure(publishableKey: "pk_test_YXJ0aXN0aWMtYm9hLTc4LmNsZXJrLmFjY291bnRzLmRldiQ")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(Clerk.shared)
                .preferredColorScheme(.light)
        }
    }
}
