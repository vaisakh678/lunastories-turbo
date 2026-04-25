//
//  ContentView.swift
//  Milo Tales
//
//  Created by vaisakh b on 25/04/26.
//

import SwiftUI
import ClerkKit

struct ContentView: View {
    @Environment(Clerk.self) private var clerk

    var body: some View {
        Group {
            if clerk.user != nil {
                HomeView()
            } else {
                GetStartedView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: clerk.user != nil)
    }
}
